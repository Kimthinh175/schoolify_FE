'use client';

import * as React from 'react';
import {
  Sparkles,
  GraduationCap,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  User as UserIcon,
  Loader2,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  formatGradeLabel,
  getCurrentSchoolSemester,
  saveGuestOnboarding,
} from '@/lib/semester-utils';
import { useAuthStore } from '@/store/auth.store';
import { chapterRoadmapService } from '@/services/chapter-roadmap.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type GradeOnboardingMode = 'FIRST_LOGIN' | 'GUEST_TRIAL';

interface GradeOnboardingModalProps {
  isOpen: boolean;
  mode: GradeOnboardingMode;
  onClose?: () => void;
  /** Gọi ngay sau khi lưu xong để mở tiếp bản đồ chòm sao các chương */
  onCompleted?: (result: { grade: 10 | 11 | 12; fullname: string }) => void;
  subjectName?: string;
}

const GRADE_OPTIONS: Array<{
  grade: 10 | 11 | 12;
  title: string;
  subtitle: string;
  highlight: string;
}> = [
  {
    grade: 10,
    title: 'Lớp 10',
    subtitle: 'Nền tảng THPT · GDPT 2018',
    highlight: 'Mệnh đề, Hàm bậc hai, Vectơ Oxy & Python cơ bản',
  },
  {
    grade: 11,
    title: 'Lớp 11',
    subtitle: 'Bứt phá tư duy · GDPT 2018',
    highlight: 'Lượng giác, Đạo hàm, Hình không gian & SQL/Thuật toán',
  },
  {
    grade: 12,
    title: 'Lớp 12',
    subtitle: 'Về đích Tốt nghiệp THPT',
    highlight: 'Khảo sát hàm, Tích phân, Tọa độ Oxyz & AI/Web/CSDL',
  },
];

export function GradeOnboardingModal({
  isOpen,
  mode,
  onClose,
  onCompleted,
  subjectName,
}: GradeOnboardingModalProps) {
  const { user, token, updateUser, fetchMe } = useAuthStore();
  const semesterInfo = React.useMemo(() => getCurrentSchoolSemester(), []);

  const [fullname, setFullname] = React.useState<string>('');
  const [selectedGrade, setSelectedGrade] = React.useState<10 | 11 | 12 | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (mode === 'FIRST_LOGIN' && user?.fullname) {
        setFullname(user.fullname);
      }
    }
  }, [isOpen, mode, user?.fullname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'GUEST_TRIAL' && fullname.trim().length < 2) {
      setErrorMsg('Vui lòng nhập tên của bạn (ít nhất 2 ký tự) để cá nhân hóa lộ trình.');
      return;
    }

    if (!selectedGrade) {
      setErrorMsg('Vui lòng chọn khối lớp bạn đang theo học.');
      return;
    }

    if (mode === 'GUEST_TRIAL') {
      const saved = saveGuestOnboarding({
        fullname: fullname.trim(),
        grade: selectedGrade,
        semester: semesterInfo.semester,
        schoolYear: semesterInfo.schoolYear,
      });
      chapterRoadmapService.notifyUpdated();
      toast.success(
        `Chào ${saved.fullname}! Đã tạo lộ trình ${formatGradeLabel(saved.grade)} (${semesterInfo.label}).`,
      );
      onCompleted?.({ grade: saved.grade, fullname: saved.fullname });
      return;
    }

    // FIRST_LOGIN: Lưu trực tiếp vào PostgreSQL qua PATCH /api/v1/users/:id
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      const gradeLabel = formatGradeLabel(selectedGrade);
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          grade_level: gradeLabel,
          ...(fullname.trim().length >= 2 && fullname.trim() !== user.fullname
            ? { fullname: fullname.trim() }
            : {}),
        }),
      });

      if (!res.ok) {
        throw new Error('Không thể lưu thông tin khối lớp lúc này.');
      }

      updateUser({
        fullname: fullname.trim().length >= 2 ? fullname.trim() : user.fullname,
        student_profile: {
          ...(user.student_profile || { id: '', user_id: user.id, points: 0 }),
          grade_level: gradeLabel,
        } as any,
      });
      await fetchMe().catch(() => null);
      chapterRoadmapService.notifyUpdated();
      toast.success(`Đã thiết lập lộ trình ${gradeLabel} · ${semesterInfo.label}!`);
      onCompleted?.({
        grade: selectedGrade,
        fullname: fullname.trim() || user.fullname || 'Bạn',
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi kết nối máy chủ, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        // Khi FIRST_LOGIN bắt buộc chọn lớp để mở lộ trình đúng lớp; GUEST_TRIAL cho phép đóng quay lại
        if (mode === 'GUEST_TRIAL' && onClose) {
          onClose();
        }
      }}
      showCloseButton={mode === 'GUEST_TRIAL'}
      className="max-w-lg p-0 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl"
    >
      {/* Header thương hiệu Schoolify Cyan -> Deep Navy */}
      <div className="relative px-5 sm:px-7 pt-6 pb-5 bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 text-white overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/15 blur-xl"
        />
        <div className="relative flex flex-wrap items-center gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            {mode === 'GUEST_TRIAL' ? 'Làm thử miễn phí · Không cần tài khoản' : 'Thiết lập lộ trình học tập'}
          </span>
        </div>

        <h2 className="relative text-xl sm:text-2xl font-extrabold tracking-tight leading-snug">
          {mode === 'GUEST_TRIAL'
            ? `Vẽ lộ trình ${subjectName || 'chuyên đề'} cho riêng bạn`
            : `Chào ${user?.fullname || 'bạn'}! Bạn đang học lớp mấy?`}
        </h2>
        <p className="relative mt-1.5 text-xs sm:text-sm text-cyan-50 leading-relaxed">
          {mode === 'GUEST_TRIAL'
            ? 'Nhập tên và chọn lớp đang học để hệ thống mở đúng cây chuyên đề từng chương và tặng ngay 1 đề trải nghiệm.'
            : 'Chọn khối lớp hiện tại để Schoolify vẽ bản đồ từng chương bám sát sách giáo khoa và kỳ học thực tế của bạn.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
        {/* Kỳ học tự động tính theo thời gian thực */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Kỳ học tính theo thời gian thực
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white break-words">
                {semesterInfo.badgeText}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shrink-0">
            Tự động đồng bộ
          </span>
        </div>

        {/* Nhập tên (Bắt buộc ở GUEST_TRIAL, hiển thị gọn nếu user chưa đặt tên rõ ở FIRST_LOGIN) */}
        {mode === 'GUEST_TRIAL' && (
          <div className="space-y-1.5">
            <label
              htmlFor="onboarding-fullname"
              className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200"
            >
              Tên gọi của bạn <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="onboarding-fullname"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Ví dụ: Minh Khôi, Thảo Vy..."
                maxLength={50}
                autoFocus
                className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900 text-sm font-medium"
              />
            </div>
          </div>
        )}

        {/* Chọn khối lớp 10 / 11 / 12 dạng nút chọn */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              Chọn khối lớp của bạn <span className="text-rose-500">*</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {GRADE_OPTIONS.map((opt) => {
              const isSelected = selectedGrade === opt.grade;
              return (
                <button
                  key={opt.grade}
                  type="button"
                  onClick={() => {
                    setSelectedGrade(opt.grade);
                    setErrorMsg('');
                  }}
                  className={cn(
                    'w-full min-h-[60px] p-3.5 rounded-2xl border-2 border-b-4 text-left transition-all flex items-center justify-between gap-3 cursor-pointer active:translate-y-0.5',
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 dark:border-cyan-400 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 hover:border-cyan-300 dark:hover:border-slate-700',
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-white">
                        {opt.title}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {opt.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">
                      {opt.highlight}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors',
                      isSelected
                        ? 'bg-cyan-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-700',
                    )}
                  >
                    {isSelected && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="pt-1 flex flex-wrap items-center justify-end gap-2.5">
          {mode === 'GUEST_TRIAL' && onClose && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="min-h-[44px] rounded-xl font-bold"
            >
              Để sau
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex-1 min-h-[48px] rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-sm border-b-4 border-cyan-700 active:border-b-2 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang thiết lập lộ trình...
              </>
            ) : (
              <>
                {mode === 'GUEST_TRIAL'
                  ? 'Mở Lộ Trình Của Tôi Ngay'
                  : 'Lưu Khối Lớp & Xem Lộ Trình'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
