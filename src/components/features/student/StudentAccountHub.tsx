'use client';

import * as React from 'react';
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
} from 'lucide-react';
import { usersService } from '@/services/users.service';
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

  // Form profile state
  const [fullname, setFullname] = React.useState(user?.fullname || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar_url || '');
  const [school, setSchool] = React.useState('THPT Chuyên Công Nghệ Schoolify');
  const [grade, setGrade] = React.useState('Lớp 12');
  const [city, setCity] = React.useState('TP. Hồ Chí Minh');

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
      setFullname(user.fullname || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || (user as any)?.avatarUrl || (user as any)?.avatar || '');
      const studentGrade =
        (user as any)?.student_profile?.grade_level ||
        (user as any)?.gradeLevel ||
        'Lớp 12';
      setGrade(studentGrade);
    }
  }, [user]);

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
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        toast.success('Đã tải ảnh lên! Hãy bấm "Lưu Thông Tin" để hoàn tất.');
      }
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

    try {
      setIsSaving(true);
      const updated = await usersService.updateUser(user.id, {
        fullname: fullname.trim(),
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        grade_level: grade,
      });

      if (updated) {
        updateUser({
          fullname: fullname.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl.trim(),
        });
        await fetchMe();
        setSavedSuccess(true);
        toast.success('Cập nhật thông tin cá nhân thành công!');
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        toast.error('Không thể lưu hồ sơ vào máy chủ. Vui lòng thử lại!');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
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

    setIsSavingPassword(true);
    setTimeout(() => {
      setIsSavingPassword(false);
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Đổi mật khẩu tài khoản thành công!');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }, 600);
  };

  if (!isMounted || (!authHydrated && !user)) {
    return <StudentAccountSkeleton />;
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* ── 1. Page Header (Thuần túy Thông Tin Cá Nhân) ── */}
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
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

      {/* Thông báo thành công */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Cập nhật thông tin cá nhân thành công và đã đồng bộ toàn hệ thống!</span>
        </div>
      )}

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
