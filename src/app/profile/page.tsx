'use client';

import * as React from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  ShieldCheck,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Link as LinkIcon,
  Loader2,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/auth.store';
import { usersService } from '@/services/users.service';
import { useRouter } from 'next/navigation';

const PRESET_AVATARS = [
  {
    name: 'Học sinh Nam 1',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Học sinh Nữ 1',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Học sinh Nam 2',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Học sinh Nữ 2',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Thầy Giáo',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cô Giáo',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
];

const GRADE_LEVELS = [
  'Lớp 1',
  'Lớp 2',
  'Lớp 3',
  'Lớp 4',
  'Lớp 5',
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12',
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, currentRole, updateUser, fetchMe } = useAuthStore();

  React.useEffect(() => {
    if (currentRole === 'STUDENT') {
      router.replace('/student');
    }
  }, [currentRole, router]);

  const [fullname, setFullname] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [gradeLevel, setGradeLevel] = React.useState('Lớp 12');
  const [address, setAddress] = React.useState('TP. Hồ Chí Minh, Việt Nam');
  const [bio, setBio] = React.useState('');

  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);
  const [customAvatarInput, setCustomAvatarInput] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Đồng bộ thông tin từ AuthStore khi mount hoặc khi user thay đổi
  React.useEffect(() => {
    if (user) {
      setFullname(user.fullname || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUrl(
        user.avatar_url ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
      );
      const studentGrade =
        (user as any)?.student_profile?.grade_level ||
        (user as any)?.gradeLevel ||
        'Lớp 12';
      setGradeLevel(studentGrade);
      setCustomAvatarInput(user.avatar_url || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setErrorMsg('Không tìm thấy tài khoản đăng nhập hiện tại.');
      return;
    }

    if (!fullname.trim()) {
      setErrorMsg('Vui lòng nhập Họ và tên.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMsg(null);

      const updated = await usersService.updateUser(user.id, {
        fullname: fullname.trim(),
        phone: phone.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        grade_level: gradeLevel,
      });

      if (updated) {
        // Cập nhật Auth Store ngay lập tức để Header và các trang khác đồng bộ
        updateUser({
          fullname: fullname.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl.trim(),
        });
        await fetchMe();

        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        setErrorMsg('Không thể lưu hồ sơ lên máy chủ. Vui lòng thử lại!');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra trong quá trình cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Quản Trị Hệ Thống';
      case 'TEACHER':
        return 'Giảng Viên / Giáo Viên';
      case 'STUDENT':
        return 'Học Sinh Luyện Thi';
      default:
        return 'Người Dùng Schoolify';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* ── Page Header ── */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F8FC] dark:bg-[#00B8DD]/15 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] mb-2">
          <User className="w-3.5 h-3.5 text-[#00B8DD]" />
          <span>Đợt 4 — Hồ Sơ Cá Nhân</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Chỉnh Sửa Hồ Sơ Cá Nhân
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cập nhật họ tên, ảnh đại diện, số điện thoại và khối lớp trực tiếp vào cơ sở dữ liệu PostgreSQL.
        </p>
      </div>

      {/* Thông báo thành công */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Cập nhật thông tin hồ sơ cá nhân thành công và đã đồng bộ toàn hệ thống!</span>
        </div>
      )}

      {/* Thông báo lỗi */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Avatar & Quick Info */}
        <Card className="p-6 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar
                src={avatarUrl}
                alt={fullname || 'Avatar'}
                size="xl"
                className="w-24 h-24 sm:w-28 sm:h-28 text-2xl border-4 border-[#00B8DD]/25 shadow-md object-cover"
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#00B8DD] text-white hover:bg-[#009BBD] transition-all shadow-lg cursor-pointer hover:scale-105 active:scale-95"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {fullname || 'Chưa cập nhật tên'}
                </h3>
                <Badge variant="primary" className="bg-[#00B8DD] text-white font-bold text-[10px]">
                  {getRoleLabel(currentRole)}
                </Badge>
                {gradeLevel && currentRole === 'STUDENT' && (
                  <Badge variant="outline" className="border-[#00B8DD]/40 text-[#007D99] dark:text-[#00B8DD] font-bold text-[10px]">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    {gradeLevel}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{email}</p>
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-[#00B8DD]" /> Nền tảng Giáo Dục Schoolify
                </span>

              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#00B8DD]" />
              {showAvatarPicker ? 'Đóng chọn Avatar' : 'Đổi ảnh đại diện'}
            </Button>
          </div>

          {/* Panel Chọn Avatar */}
          {showAvatarPicker && (
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Chọn ảnh đại diện mẫu có sẵn:
                </label>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {PRESET_AVATARS.map((item, idx) => {
                  const isSelected = avatarUrl === item.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(item.url)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 ring-2 ring-[#00B8DD]'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <Avatar src={item.url} alt={item.name} size="md" className="w-12 h-12" />
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate w-full text-center">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hoặc dán link ảnh trực tiếp (URL):
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    value={customAvatarInput}
                    onChange={(e) => setCustomAvatarInput(e.target.value)}
                    leftIcon={<LinkIcon className="w-4 h-4 text-slate-400" />}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (customAvatarInput.trim()) {
                        setAvatarUrl(customAvatarInput.trim());
                      }
                    }}
                    className="shrink-0 text-xs font-bold"
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Card 2: Thông tin chi tiết */}
        <Card className="p-6 border-slate-200 dark:border-slate-800 space-y-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-[#00B8DD]" />
            <span>Thông Tin Cá Nhân & Tài Khoản</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <Input
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                leftIcon={<User className="w-4 h-4 text-[#00B8DD]" />}
                placeholder="Nhập họ và tên đầy đủ..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Địa chỉ Email <span className="text-slate-400 font-normal">(Cố định)</span>
              </label>
              <div className="relative">
                <Input
                  value={email}
                  disabled
                  leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                  className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 cursor-not-allowed pr-8 font-mono"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Email là định danh tài khoản đăng nhập trên hệ thống.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Số điện thoại
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4 text-[#00B8DD]" />}
                placeholder="Nhập số điện thoại (ví dụ: 0912345678)..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Khối lớp học tập
              </label>
              <div className="relative">
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full h-10 px-3 pl-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#00B8DD]"
                >
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <GraduationCap className="w-4 h-4 text-[#00B8DD] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Khối lớp giúp hệ thống gợi ý đề thi và câu hỏi luyện tập phù hợp.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Tỉnh / Thành phố
              </label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4 text-[#00B8DD]" />}
                placeholder="Nhập tỉnh/thành phố bạn đang học..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Giới thiệu ngắn (Bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#00B8DD]"
              placeholder="Chia sẻ mục tiêu học tập hoặc đôi nét về bạn..."
            />
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold px-6 py-2.5 shadow-md shadow-[#00B8DD]/20 cursor-pointer disabled:opacity-60"
            leftIcon={
              isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )
            }
          >
            {isSaving ? 'Đang lưu vào PostgreSQL...' : 'Lưu Thay Đổi Hồ Sơ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
