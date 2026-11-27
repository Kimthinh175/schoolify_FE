'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  MapPin,
  Lock,
  Camera,
  CheckCircle2,
  Save,
  Loader2,
  Upload,
  ShieldCheck,
  Sparkles,
  Calendar,
  Crown,
  Clock,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import {
  usersService,
  getLocalProfileMetadata,
  normalizeGradeLevelLabel,
} from '@/services/users.service';
import { examPointsService } from '@/services/exam-points.service';
import { chapterRoadmapService } from '@/services/chapter-roadmap.service';
import { getGuestOnboarding } from '@/lib/semester-utils';
import { useNotificationsStore } from '@/store/notifications.store';
import { Progress } from '@/components/ui/progress';
import { TiaSangIcon, NgocIcon } from '@/components/ui/point-icons';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFrame, AvatarFrameSelector, useActiveAvatarFrame } from '@/components/ui/avatar-frame';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';

const PRESET_AVATARS = [
  { name: 'Học sinh Nam 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { name: 'Học sinh Nữ 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { name: 'Học sinh Nam 2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
  { name: 'Học sinh Nữ 2', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80' },
  { name: 'Thầy Giáo', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
  { name: 'Cô Giáo', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
];

const GRADE_LEVELS = [
  'Lớp 12',
  'Lớp 11',
  'Lớp 10',
  'Lớp 9',
  'Lớp 8',
  'Lớp 7',
  'Lớp 6',
  'Lớp 5',
  'Lớp 4',
  'Lớp 3',
  'Lớp 2',
  'Lớp 1',
];

import { StudentAccountSkeleton } from '@/components/skeletons/page-skeletons';

export function StudentAccountHub() {
  const { user, updateUser, fetchMe } = useAuthStore();
  const { frameTier, setTier: setFrameTier } = useActiveAvatarFrame();
  const [isMounted, setIsMounted] = React.useState(false);
  const [authHydrated, setAuthHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (useAuthStore.persist?.hasHydrated?.()) {
      setAuthHydrated(true);
    } else {
      const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
        setAuthHydrated(true);
      });
      const timer = setTimeout(() => setAuthHydrated(true), 200);
      return () => {
        unsub?.();
        clearTimeout(timer);
      };
    }
  }, []);

  // Form profile state (Đồng bộ bảng users + student_profile)
  const [fullname, setFullname] = React.useState(user?.fullname || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar_url || '');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [school, setSchool] = React.useState('');
  const [grade, setGrade] = React.useState('Lớp 12');
  const [city, setCity] = React.useState('');
  const [bio, setBio] = React.useState('');

  // Snapshot các trường kinh tế & gói cước của student_profile
  const [examPointsBalance, setExamPointsBalance] = React.useState<number>(9);
  const [diamondsBalance, setDiamondsBalance] = React.useState<number>(100);
  const [activePackageName, setActivePackageName] = React.useState<string>('FREE');
  const [packageExpiresAt, setPackageExpiresAt] = React.useState<string | null>(null);
  const [lastDailyGrantDate, setLastDailyGrantDate] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  React.useEffect(() => {
    if (user) {
      const sp = (user as any)?.student_profile || {};
      const localMeta = getLocalProfileMetadata(user.id);

      setFullname(user.fullname || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || (user as any)?.avatarUrl || (user as any)?.avatar || '');

      const rawGrade = sp.grade_level || (user as any)?.gradeLevel || 'Lớp 12';
      setGrade(normalizeGradeLevelLabel(rawGrade));

      const rawDob = sp.date_of_birth || (user as any)?.dateOfBirth || localMeta.date_of_birth || '';
      setDateOfBirth(rawDob ? String(rawDob).slice(0, 10) : '');

      setSchool(
        sp.school_name ||
          (user as any)?.schoolName ||
          localMeta.school_name ||
          ''
      );
      setCity(sp.province || (user as any)?.province || localMeta.province || '');
      setBio(sp.bio || (user as any)?.bio || localMeta.bio || '');

      if (typeof sp.exam_points === 'number') setExamPointsBalance(sp.exam_points);
      if (typeof sp.points === 'number') setDiamondsBalance(sp.points);
      if (sp.active_package) setActivePackageName(sp.active_package);
      if (sp.package_expires_at) setPackageExpiresAt(sp.package_expires_at);
      if (sp.last_daily_grant_date) setLastDailyGrantDate(sp.last_daily_grant_date);
    }
  }, [user]);

  // Đồng bộ số dư Tia Sáng & Ngọc Tri Thức thực tế từ Backend
  React.useEffect(() => {
    if (!user?.id) {
      setExamPointsBalance(0);
      setDiamondsBalance(0);
      setLastDailyGrantDate(null);
      setFullname('');
      setEmail('');
      setPhone('');
      setAvatarUrl('');
      setDateOfBirth('');
      setSchool('');
      setCity('');
      setBio('');
      return;
    }
    examPointsService
      .getBalance(user.id)
      .then((bal) => {
        if (!bal) return;
        if (typeof bal.currentPoints === 'number') setExamPointsBalance(bal.currentPoints);
        if (typeof bal.diamonds === 'number') setDiamondsBalance(bal.diamonds);
        if (bal.activePackage) setActivePackageName(bal.activePackage);
        if (bal.lastDailyGrantDate) setLastDailyGrantDate(bal.lastDailyGrantDate);
      })
      .catch(() => {});
  }, [user?.id]);

  // Tự động kiểm tra và đồng bộ tiến độ làm bài thử ở chế độ Khách (Guest Try-First) vào tài khoản
  React.useEffect(() => {
    if (!user?.id) return;
    const guest = getGuestOnboarding();
    if (!guest) return;
    const hasGuestProgress =
      Object.keys(guest.completedChapters || {}).length > 0 ||
      Object.keys(guest.completedDiagnostics || {}).length > 0 ||
      Boolean(guest.pendingTrialSubmission);

    if (hasGuestProgress) {
      chapterRoadmapService
        .syncGuestOnboarding()
        .then((synced) => {
          if (synced) {
            useNotificationsStore.getState().addNotification({
              id: `guest-sync-${Date.now()}`,
              type: 'success',
              category: 'LEARNING',
              title: 'Đã đồng bộ tiến độ làm thử vào Hồ sơ',
              message:
                'Kết quả đánh giá năng lực và tiến độ chương bạn làm thử trước khi đăng nhập đã được hợp nhất vào tài khoản.',
              link: '/student/practice',
            });
          }
        })
        .catch(() => {});
    }
  }, [user?.id]);

  // Tính toán Độ hoàn thiện Hồ sơ Học sinh (Profile Completeness 0% -> 100%)
  const profileCompletion = React.useMemo(() => {
    const checks = [
      { label: 'Họ và tên', done: Boolean(fullname.trim()) },
      { label: 'Email định danh', done: Boolean(email.trim()) },
      { label: 'Số điện thoại', done: Boolean(phone.trim()) },
      { label: 'Ảnh đại diện', done: Boolean(avatarUrl.trim() || user?.avatar_url) },
      { label: 'Ngày sinh', done: Boolean(dateOfBirth.trim()) },
      { label: 'Khối lớp', done: Boolean(grade.trim()) },
      { label: 'Trường THPT', done: Boolean(school.trim()) },
      { label: 'Mục tiêu học tập (Bio)', done: Boolean(bio.trim()) },
    ];
    const doneCount = checks.filter((c) => c.done).length;
    const percent = Math.round((doneCount / checks.length) * 100);
    const missing = checks.filter((c) => !c.done).map((c) => c.label);
    return { percent, doneCount, total: checks.length, missing };
  }, [fullname, email, phone, avatarUrl, user?.avatar_url, dateOfBirth, grade, school, bio]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB. Vui lòng chọn ảnh khác.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const rawDataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        try {
          const maxSize = 256;
          const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(img.width * ratio));
          canvas.height = Math.max(1, Math.round(img.height * ratio));
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            setAvatarUrl(compressed);
          } else {
            setAvatarUrl(rawDataUrl);
          }
        } catch {
          setAvatarUrl(rawDataUrl);
        }
        toast.success('Đã tải ảnh lên! Hãy bấm "Lưu Thay Đổi Thông Tin" để hoàn tất.');
      };
      img.onerror = () => {
        setAvatarUrl(rawDataUrl);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Không tìm thấy tài khoản học sinh.');
      return;
    }

    if (!fullname.trim()) {
      toast.error('Vui lòng nhập Họ và tên.');
      return;
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^(0|\+84)[0-9]{8,10}$/.test(trimmedPhone.replace(/\s+/g, ''))) {
      toast.error('Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678).');
      return;
    }

    if (dateOfBirth) {
      const dobDate = new Date(dateOfBirth);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (Number.isNaN(dobDate.getTime()) || dobDate > today) {
        toast.error('Ngày sinh không hợp lệ hoặc không thể ở tương lai.');
        return;
      }
    }

    try {
      setIsSaving(true);
      const updated = await usersService.updateUser(user.id, {
        fullname: fullname.trim(),
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        grade_level: grade,
        date_of_birth: dateOfBirth.trim() || undefined,
        school_name: school.trim() || undefined,
        province: city.trim() || undefined,
        bio: bio.trim() || undefined,
        equipped_frame: frameTier,
      });

      const currentSp = (user as any)?.student_profile || {};
      updateUser({
        fullname: updated?.fullname || fullname.trim(),
        phone: updated?.phone ?? (phone.trim() || undefined),
        avatar_url: updated?.avatar_url ?? (avatarUrl.trim() || undefined),
        student_profile: {
          ...currentSp,
          grade_level: updated?.gradeLevel || grade,
          date_of_birth: dateOfBirth.trim() || currentSp.date_of_birth || null,
          school_name: school.trim() || currentSp.school_name || null,
          province: city.trim() || currentSp.province || null,
          bio: bio.trim() || currentSp.bio || null,
          equipped_frame: frameTier,
        },
      } as any);
      await fetchMe().catch(() => {});
      setSavedSuccess(true);
      toast.success('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setIsSavingPassword(true);
      const token = useAuthStore.getState().token;
      const res = await fetch('/api/v1/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = Array.isArray(json?.message)
          ? json.message.join(', ')
          : json?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.';
        toast.error(msg);
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Đổi mật khẩu tài khoản thành công!');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      toast.error(err?.message || 'Lỗi kết nối khi đổi mật khẩu.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!isMounted || (!authHydrated && !user)) {
    return <StudentAccountSkeleton />;
  }

  if (authHydrated && !user) {
    return (
      <Card className="max-w-lg mx-auto my-12 p-8 text-center space-y-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="w-12 h-12 rounded-2xl bg-[#00B8DD]/10 text-[#00B8DD] flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Phiên đăng nhập đã kết thúc
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Vui lòng đăng nhập tài khoản học sinh để xem và quản lý hồ sơ cá nhân của bạn.
        </p>
        <Link href="/login/student?returnUrl=/student" className="inline-block">
          <Button className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-semibold rounded-xl px-5">
            Đăng nhập ngay
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* ── 1. Page Header (Thuần túy Thông Tin Cá Nhân) ── */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Badge variant="outline" className="mb-2 bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/25 font-bold">
            <User className="w-3.5 h-3.5 mr-1 text-[#00B8DD]" />
            Hồ Sơ Cá Nhân
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Thông Tin Cá Nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý thông tin hồ sơ học sinh, ảnh đại diện, khối lớp học tập và bảo mật tài khoản.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link href="/student/exams">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs font-bold border-[#00B8DD]/40 text-[#007D99] dark:text-[#00B8DD] hover:bg-[#00B8DD]/10 rounded-xl cursor-pointer gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#00B8DD]" />
              <span>Lịch Sử Luyện Thi &amp; Điểm Số</span>
            </Button>
          </Link>
          <Link href="/student/practice">
            <Button
              size="sm"
              className="h-9 px-3.5 text-xs font-bold bg-[#00B8DD] hover:bg-[#009bbd] text-white rounded-xl cursor-pointer gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hồ Sơ Năng Lực &amp; Lộ Trình AI</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Thông báo thành công */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Cập nhật thông tin cá nhân thành công và đã đồng bộ toàn hệ thống!</span>
        </div>
      )}

      {/* ── 1.5. Dashboard Tóm Tắt Hồ Sơ Học Sinh (student_profile Snapshot) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Gói cước & Hạn dùng (active_package, package_expires_at) */}
        <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Gói học tập hiện tại
            </span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              {activePackageName && activePackageName !== 'FREE'
                ? activePackageName
                : 'Gói Cơ Bản (Free)'}
            </span>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#00B8DD] hover:underline shrink-0"
            >
              <span>Nâng cấp</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
            {packageExpiresAt
              ? `Hết hạn: ${new Date(packageExpiresAt).toLocaleDateString('vi-VN')}`
              : 'Hiệu lực: Vĩnh viễn (Cấp 9 tia/ngày)'}
          </p>
        </Card>

        {/* Card 2: Năng lượng Tia Sáng (exam_points & last_daily_grant_date) */}
        <Card className="p-4 rounded-2xl border border-amber-200/70 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/15 shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">
              Tia Sáng luyện đề
            </span>
            <TiaSangIcon className="w-4 h-4" flat />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-700 dark:text-amber-300 tabular-nums">
              {examPointsBalance}
            </span>
            <span className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/80">
              tia khả dụng
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {lastDailyGrantDate
              ? `Cấp gần nhất: ${lastDailyGrantDate}`
              : 'Cấp tự động 9 Tia Sáng mỗi ngày'}
          </p>
        </Card>

        {/* Card 3: Ngọc Tri Thức tích lũy (points) */}
        <Card className="p-4 rounded-2xl border border-cyan-200/70 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/15 shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300">
              Ngọc Tri Thức đổi quà
            </span>
            <NgocIcon className="w-4 h-4" flat />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#007D99] dark:text-[#00B8DD] tabular-nums">
                {new Intl.NumberFormat('vi-VN').format(diamondsBalance)}
              </span>
              <span className="text-xs font-semibold text-cyan-700/80 dark:text-cyan-400/80">
                ngọc
              </span>
            </div>
            <Link
              href="/student/rewards"
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-[#00B8DD] hover:underline shrink-0"
            >
              <span>Đổi quà</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Tích lũy từ điểm danh, BXH & thành tựu
          </p>
        </Card>

        {/* Card 4: Khối lớp & Định danh tài khoản (grade_level, last_login_at) */}
        <Card className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Khối lớp & Trạng thái
            </span>
            <GraduationCap className="w-4 h-4 text-[#00B8DD]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {grade || 'Lớp 12'}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Đang hoạt động
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            <span>
              {user?.last_login_at
                ? `Đăng nhập: ${new Date(user.last_login_at).toLocaleDateString('vi-VN')}`
                : 'Phiên đăng nhập bảo mật'}
            </span>
          </p>
        </Card>
      </div>

      {/* ── 1.8. Thanh Độ Hoàn Thiện Hồ Sơ & Trạng Thái Liên Kết Định Danh ── */}
      <Card className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Độ hoàn thiện hồ sơ học sinh:
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-black tabular-nums',
                profileCompletion.percent === 100
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
              )}
            >
              {profileCompletion.percent}% ({profileCompletion.doneCount}/{profileCompletion.total} mục)
            </span>
          </div>

          {/* Trạng thái xác thực tài khoản (users.email, users.phone, users.google_id) */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Email đã xác thực</span>
            </span>
            {phone.trim() ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Đã liên kết SĐT</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                <span>Chưa có SĐT</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60">
              <ShieldCheck className="w-3 h-3 text-[#00B8DD]" />
              <span>{user?.google_id ? 'Đã liên kết Google' : 'Bảo mật SSO / OTP'}</span>
            </span>
          </div>
        </div>

        <Progress
          value={profileCompletion.percent}
          className="h-2 bg-slate-100 dark:bg-slate-800"
        />

        {profileCompletion.missing.length > 0 ? (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            💡 Bổ sung thêm{' '}
            <strong className="text-slate-700 dark:text-slate-200">
              {profileCompletion.missing.join(', ')}
            </strong>{' '}
            ở bên dưới để đạt 100% hồ sơ và giúp AI cá nhân hóa lộ trình chính xác nhất.
          </p>
        ) : (
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ Hồ sơ học tập của bạn đã hoàn thiện 100% tất cả các trường dữ liệu!
          </p>
        )}
      </Card>

      {/* ── 2. Card 1: Ảnh Đại Diện & Khung Danh Hiệu ── */}
      <Card className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar với AvatarFrame */}
          <div className="relative group shrink-0">
            <AvatarFrame tier={frameTier} size="2xl">
              <Avatar
                src={avatarUrl || user?.avatar_url}
                alt={fullname}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover shadow-sm"
              />
            </AvatarFrame>
            <button
              type="button"
              onClick={handleUploadClick}
              className="absolute -bottom-1 -right-1 z-20 p-2 rounded-full bg-[#00B8DD] text-white hover:bg-[#009bbd] shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-900"
              title="Tải ảnh mới từ máy"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Thông tin tóm tắt & chọn nhanh avatar */}
          <div className="space-y-2 min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {fullname || 'Học sinh Schoolify'}
              </h2>
              <Badge className="bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/30 text-[11px] font-bold">
                🎓 Học Sinh Luyện Thi
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono text-slate-500 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                Mã HS: HS-2026-8899
              </Badge>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shadow-2xs',
                  frameTier === 'STUDENT_100K'
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-400/40'
                    : frameTier === 'STUDENT_50K'
                      ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-400/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                )}
              >
                {frameTier === 'STUDENT_100K' ? (
                  <>
                    <span className="text-amber-500 text-[9px]">✦</span>
                    <span>Khung Thủ Khoa VIP</span>
                  </>
                ) : frameTier === 'STUDENT_50K' ? (
                  <>
                    <span className="text-rose-500 text-[9px]">⚡</span>
                    <span>Khung Bứt Phá</span>
                  </>
                ) : (
                  <span>Khung Tiêu Chuẩn</span>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {email}
            </p>

            {/* Chọn nhanh avatar mẫu */}
            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Hoặc chọn nhanh avatar mẫu:
              </span>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {PRESET_AVATARS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(item.url);
                      toast.info(`Đã chọn ảnh "${item.name}". Bấm "Lưu Thông Tin" để lưu lại!`);
                    }}
                    className={cn(
                      'relative p-0.5 rounded-full transition-all cursor-pointer hover:scale-105',
                      avatarUrl === item.url
                        ? 'ring-2 ring-[#00B8DD] scale-105'
                        : 'opacity-70 hover:opacity-100'
                    )}
                    title={item.name}
                  >
                    <img src={item.url} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                  </button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleUploadClick}
                  className="h-8 text-[11px] rounded-full gap-1 border-dashed cursor-pointer"
                >
                  <Upload className="w-3 h-3 text-[#00B8DD]" />
                  Tải ảnh từ máy
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Khung Avatar Danh Hiệu */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Khung Avatar Danh Hiệu:
            </label>
            <span className="text-[11px] text-slate-400">
              (Bấm chọn trực tiếp để đổi khung hiển thị)
            </span>
          </div>
          <AvatarFrameSelector
            currentTier={frameTier}
            onSelectTier={(selected) => {
              setFrameTier(selected);
              toast.success('Đã cập nhật khung avatar!', {
                description:
                  selected === 'STUDENT_100K'
                    ? 'Đã áp dụng Khung Thủ Khoa VIP (Ánh kim & Hào quang quý phái).'
                    : selected === 'STUDENT_50K'
                      ? 'Đã áp dụng Khung Bứt Phá (Gradient năng lượng hiện đại).'
                      : 'Đã áp dụng Khung Tiêu Chuẩn (Tối giản & thanh lịch).',
              });
            }}
          />
        </div>
      </Card>

      {/* ── 3. Card 2: Chi Tiết Thông Tin Cá Nhân & Form Cập Nhật ── */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-[#00B8DD]" />
              <span>Chi Tiết Hồ Sơ Cá Nhân</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chỉnh sửa thông tin cá nhân và nhấn Lưu để đồng bộ vào cơ sở dữ liệu.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Họ và tên thí sinh <span className="text-rose-500">*</span>
              </label>
              <Input
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                leftIcon={<User className="w-4 h-4 text-[#00B8DD]" />}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ Email <span className="text-slate-400 font-normal">(Cố định theo tài khoản)</span>
              </label>
              <Input
                value={email}
                disabled
                className="bg-slate-100 dark:bg-slate-800/60 font-mono text-slate-500 cursor-not-allowed"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số điện thoại liên lạc
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912 345 678"
                leftIcon={<Phone className="w-4 h-4 text-[#00B8DD]" />}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Ngày sinh (date_of_birth)
              </label>
              <Input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4 text-[#00B8DD]" />}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Khối lớp học tập
              </label>
              <div className="relative">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-10 px-3.5 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD] cursor-pointer"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-[#00B8DD] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Trường THPT
              </label>
              <Input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Tên trường học của bạn"
                leftIcon={<Building className="w-4 h-4 text-[#00B8DD]" />}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tỉnh / Thành phố
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="TP. Hồ Chí Minh"
                leftIcon={<MapPin className="w-4 h-4 text-[#00B8DD]" />}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mục tiêu học tập & Giới thiệu ngắn (Bio)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Mục tiêu đạt 9+ Toán kỳ thi THPT Quốc Gia & ĐGNL..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-[#00B8DD]/20 cursor-pointer gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu thông tin...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi Thông Tin</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── 4. Card 3: Bảo Mật & Đổi Mật Khẩu ── */}
      <Card className="p-6 border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-xs space-y-5">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00B8DD]" />
            <span>Bảo Mật &amp; Đổi Mật Khẩu</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Khuyến nghị đặt mật khẩu có ít nhất 6 ký tự để bảo vệ tài khoản của bạn.
          </p>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Đổi mật khẩu tài khoản thành công!</span>
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Mật khẩu hiện tại
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mật khẩu mới
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-[#00B8DD]" />}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-[#00B8DD]" />}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSavingPassword}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer shadow-xs gap-2"
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Cập Nhật Mật Khẩu</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
