'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Gift,
  User,
  Award,
  BookOpen,
  Sparkles,
  Gem,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
  Lock,
  Phone,
  Mail,
  MapPin,
  Building,
  GraduationCap,
  Trophy,
  ChevronRight,
  Edit3,
  Pencil,
  Save,
  Target,
  BarChart3,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Flame,
  Camera,
  Loader2,
  AlertCircle,
  Upload,
  RotateCcw,
  Check,
  Layers,
} from 'lucide-react';
import { usersService } from '@/services/users.service';
import { examSnapshotService } from '@/services/exam-snapshot.service';
import { examPointsService } from '@/services/exam-points.service';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { PracticeHistoryList } from '@/components/features/student/PracticeHistoryList';

const PRESET_AVATARS = [
  { name: 'Học sinh Nam 1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80' },
  { name: 'Học sinh Nữ 1', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' },
  { name: 'Học sinh Nam 2', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80' },
  { name: 'Học sinh Nữ 2', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80' },
  { name: 'Thầy Giáo', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
  { name: 'Cô Giáo', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
];

export function StudentAccountHub() {
  const { user, updateUser, fetchMe } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'exams' | 'courses' | 'wallet' | 'security'>('profile');

  // Form profile state
  const [fullname, setFullname] = React.useState(user?.fullname || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar_url || '');
  const [school, setSchool] = React.useState('THPT Chuyên Công Nghệ Schoolify');
  const [grade, setGrade] = React.useState('Lớp 12');
  const [city, setCity] = React.useState('TP. Hồ Chí Minh');
  const [targetExam, setTargetExam] = React.useState('DGNL_HCM');

  // Daily Check-in State with Real Backend Diamonds
  const [hasCheckedIn, setHasCheckedIn] = React.useState(false);
  const [checkInStreak, setCheckInStreak] = React.useState(3);
  const [diamonds, setDiamonds] = React.useState<number>(() => {
    return Number((user as any)?.student_profile?.exam_points ?? (user as any)?.student_profile?.points ?? 9);
  });

  // Gọi trực tiếp backend để đồng bộ số Kim Cương (💎)
  React.useEffect(() => {
    // 1. Cập nhật từ user trong AuthStore
    if (user) {
      const dbDiamonds = (user as any)?.student_profile?.exam_points ?? (user as any)?.student_profile?.points;
      if (typeof dbDiamonds === 'number') {
        setDiamonds(dbDiamonds);
      }
    }

    // 2. Gọi backend examPointsService.getBalance() để lấy số liệu thực tế mới nhất từ PostgreSQL
    examPointsService.getBalance().then((balance) => {
      if (balance) {
        if (typeof balance.currentPoints === 'number') {
          setDiamonds(balance.currentPoints);
        } else if (typeof balance.diamonds === 'number') {
          setDiamonds(balance.diamonds);
        }

        if (balance.alreadyClaimedToday) {
          setHasCheckedIn(true);
        }
      }
    }).catch(() => {});
  }, [user]);

  const handleCheckIn = async () => {
    try {
      // Gọi trực tiếp API backend điểm danh
      const res: any = await examPointsService.claimDailyPoints({ forceReset: false });

      // Nếu backend trả về đã điểm danh hôm nay rồi
      if (res && (res.claimed === false || res.data?.claimed === false || res.alreadyClaimedToday || res.data?.alreadyClaimedToday)) {
        setHasCheckedIn(true);
        const msg = res.message || res.data?.message || 'Bạn đã điểm danh hôm nay rồi nhé! Mỗi ngày chỉ được điểm danh 1 lần, vui lòng quay lại vào ngày mai.';
        toast.info('Bạn đã điểm danh hôm nay rồi nhé!', {
          description: msg,
        });
        return;
      }

      // Điểm danh thành công: Cập nhật trực tiếp số dư thực tế từ backend (+9 Kim Cương)
      const updatedDiamonds = res?.data?.diamonds ?? res?.diamonds ?? (diamonds + 9);

      setDiamonds(updatedDiamonds);
      setHasCheckedIn(true);
      setCheckInStreak((prev) => prev + 1);

      // Đồng bộ lại AuthStore toàn hệ thống
      if (typeof fetchMe === 'function') {
        fetchMe().catch(() => {});
      }

      toast.success('Điểm danh thành công!', {
        description: `🎉 Bạn nhận được +9 Kim Cương (💎) hôm nay! Số dư ví thực tế: ${updatedDiamonds} 💎!`,
      });
    } catch (err) {
      toast.error('Có lỗi xảy ra khi kết nối backend để điểm danh.');
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const originalAvatar = user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';

  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [examCount, setExamCount] = React.useState<number>(0);
  const [avgScore, setAvgScore] = React.useState<string>('0.0');

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  React.useEffect(() => {
    examSnapshotService.getExamSnapshots().then((snaps) => {
      setExamCount(snaps.length);
      if (snaps.length > 0) {
        const sum = snaps.reduce((acc, s) => acc + (s.originalExam?.finalScore || 0), 0);
        setAvgScore((sum / snaps.length).toFixed(1));
      }
    }).catch(() => {});
  }, []);

  React.useEffect(() => {
    if (user) {
      setFullname(user.fullname || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarUrl(user.avatar_url || '');
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
      setErrorMsg('Dung lượng ảnh tối đa là 5MB. Vui lòng chọn ảnh khác.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      setErrorMsg('Không tìm thấy tài khoản học sinh.');
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
        grade_level: grade,
      });

      if (updated) {
        updateUser({
          fullname: fullname.trim(),
          phone: phone.trim(),
          avatar_url: avatarUrl.trim(),
        });
        await fetchMe();
        setIsEditModalOpen(false);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        setErrorMsg('Không thể lưu hồ sơ vào máy chủ. Vui lòng thử lại!');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword === confirmPassword) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const studentPoints = (user as any)?.student_profile?.points ?? 100;

  // Mock my courses
  const myCourses = [
    {
      id: 'c-01',
      title: 'Chuyên Đề Luyện Thi ĐGNL ĐHQG 2026 - Môn Toán & Tư Duy Định Lượng',
      author: 'ThS. Nguyễn Văn Hùng',
      progress: 68,
      completedLessons: 17,
      totalLessons: 25,
      lastAccess: 'Hôm qua',
      thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-02',
      title: 'Chiến Thuật Bứt Phá 8+ Môn Vật Lý 11 - GDPT 2018 Toàn Diện',
      author: 'ThS. Trần Thị Mai',
      progress: 85,
      completedLessons: 22,
      totalLessons: 26,
      lastAccess: '3 ngày trước',
      thumb: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-03',
      title: 'Tổng Ôn Cấp Tốc Hóa Học Hữu Cơ & Vô Cơ Lớp 12',
      author: 'Cô Lê Hoàng Yến',
      progress: 40,
      completedLessons: 8,
      totalLessons: 20,
      lastAccess: '1 tuần trước',
      thumb: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── 1. Header & Quick Actions (Chuẩn phong cách Admin Questions) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="min-w-0 max-w-3xl">
          <Badge variant="outline" className="mb-2 bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/25 font-bold">
            <GraduationCap className="w-3.5 h-3.5 mr-1 text-[#00B8DD]" />
            Cổng Học Sinh & Thí Sinh
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Tài Khoản Cá Nhân & Trung Tâm Học Tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý hồ sơ cá nhân, tiến độ luyện thi ma trận, kết quả khảo thí và ví kim cương trên Schoolify.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs gap-1.5 font-bold rounded-xl h-10 px-4 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-[#00B8DD]" />
            Chỉnh Sửa Hồ Sơ
          </Button>

          <Link href="/luyen-thi">
            <Button className="bg-[#00B8DD] hover:bg-[#009bbd] text-white text-xs gap-1.5 font-bold shadow-md shadow-[#00B8DD]/25 rounded-xl h-10 px-4 cursor-pointer">
              <Sparkles className="w-4 h-4" />
              Vào Luyện Thi Ngay
            </Button>
          </Link>
        </div>
      </div>

      {/* Thông báo thành công */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Cập nhật thông tin thành công và đã đồng bộ toàn hệ thống!</span>
        </div>
      )}

      {/* ── 2. Thẻ Định Danh Học Sinh (Student Identity & Rewards Hub) ── */}

      <Card className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Cột Trái: Avatar + Thông tin học sinh */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0 flex-1">
            <div className="relative group shrink-0">
              <Avatar
                src={avatarUrl || originalAvatar}
                alt={fullname}
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 border-[#00B8DD]/30 shadow-sm object-cover"
              />
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#00B8DD] text-white hover:bg-[#009bbd] shadow-md cursor-pointer transition-transform hover:scale-110 active:scale-95"
                title="Đổi ảnh đại diện"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              {/* Dòng 1: Họ tên + Badge vai trò + Mã HS */}
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                  {fullname || 'Học sinh Schoolify'}
                </h2>
                <Badge className="bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border-[#00B8DD]/30 text-[11px] font-bold">
                  🎓 Học Sinh Luyện Thi
                </Badge>
                <Badge variant="outline" className="text-[10px] font-mono text-slate-500 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  Mã HS: HS-2026-8899
                </Badge>
              </div>

              {/* Dòng 2: Trường • Khối lớp • Địa phương */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[260px] sm:max-w-none">
                  <Building className="w-3.5 h-3.5 text-[#00B8DD] shrink-0" />
                  {school}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="flex items-center gap-1 font-bold text-[#007D99] dark:text-[#00B8DD]">
                  <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                  {grade}
                </span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {city}
                </span>
              </div>

              {/* Dòng 3: Thông tin liên hệ (Email & SĐT) */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 dark:text-slate-500 pt-0.5">
                <span className="flex items-center gap-1 font-mono hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {email}
                </span>
                <span className="text-slate-200 dark:text-slate-700">|</span>
                <span className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {phone || 'Chưa cập nhật SĐT'}
                </span>
              </div>
            </div>
          </div>

          {/* Cột Phải: Gamification Hub (Điểm Danh + Mục Tiêu + Tài Sản) */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
            {/* Hàng 1: Nút Điểm danh + Mục tiêu luyện thi */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between lg:justify-end w-full lg:w-auto">
              {/* Nút Điểm Danh Hàng Ngày */}
              <Button
                type="button"
                onClick={handleCheckIn}
                className={cn(
                  'h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 transition-all shadow-xs cursor-pointer',
                  hasCheckedIn
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/70'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/20 active:scale-95'
                )}
                title={hasCheckedIn ? 'Bấm để xem trạng thái điểm danh hôm nay' : 'Bấm để điểm danh nhận 9 Kim Cương'}
              >
                {hasCheckedIn ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Đã Điểm Danh ({checkInStreak} ngày 🔥)</span>
                  </>
                ) : (
                  <>
                    <Gift className="w-3.5 h-3.5" />
                    <span>Điểm Danh (+9 💎)</span>
                  </>
                )}
              </Button>

              {/* Thẻ Mục tiêu thi */}
              <div
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-700/60 transition-colors cursor-pointer group"
                title="Bấm để xem & đổi mục tiêu luyện thi"
              >
                <Target className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 block leading-tight">Mục tiêu</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                    {targetExam === 'DGNL_HCM' ? 'ĐGNL TP.HCM' : targetExam === 'DGNL_HN' ? 'ĐGNL Hà Nội' : 'THPT 2026'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hàng 2: Ví Kim Cương */}
            <div className="flex items-center gap-2 w-full justify-between sm:justify-start lg:justify-end">
              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-[#00B8DD]/30 text-[#007D99] dark:text-[#00B8DD] text-xs font-bold hover:bg-[#00B8DD]/15 transition-all cursor-pointer group shadow-2xs"
                title="Bấm để xem chi tiết Ví & Lịch sử nạp/dùng kim cương"
              >
                <Gem className="w-4 h-4 fill-[#00B8DD] text-[#00B8DD] group-hover:scale-110 transition-transform" />
                <span className="font-mono">{diamonds} 💎</span>
                <span className="text-[10px] text-slate-400 font-normal ml-0.5">Kim cương</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* ── 3. Quick Metrics Row (4 Thẻ KPI chuẩn phong cách Admin) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đề Thi Đã Luyện</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{examCount}</span>
            <span className="text-[11px] text-slate-400">đề đã làm</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Điểm Trung Bình</span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#007D99] dark:text-[#00B8DD]">{avgScore}</span>
            <span className="text-xs text-slate-400">/ 10 điểm</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Khóa Học Đã Mua</span>
            <div className="h-8 w-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">3</span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">khóa học số</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chuỗi Luyện Tập</span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">5 Ngày</span>
            <span className="text-[11px] text-rose-500 font-bold">Liên tiếp 🔥</span>
          </div>
        </Card>
      </div>

      {/* ── 4. Navigation Tabs (Phong cách Pill gọn gàng) ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'profile'
              ? 'bg-[#00B8DD] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <User className="w-3.5 h-3.5" />
          <span>Hồ Sơ & Kế Hoạch Ôn Thi</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'exams'
              ? 'bg-[#00B8DD] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Lịch Sử Luyện Đề & Ma Trận</span>
          <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
            {examCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'courses'
              ? 'bg-[#00B8DD] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Khóa Học Của Tôi</span>
          <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/20 font-mono">
            3
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'wallet'
              ? 'bg-[#00B8DD] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Gem className="w-3.5 h-3.5 text-cyan-400" />
          <span>Ví Kim Cương & Điểm Thưởng</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'security'
              ? 'bg-[#00B8DD] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Bảo Mật & Mật Khẩu</span>
        </button>
      </div>

      {/* ── 5. Tab Contents ── */}
      {/* ── TAB 1: Profile & Target Exam (Dashboard Overview) ── */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Card 1: Thông tin cá nhân & Tài khoản */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00B8DD]" />
                  <span>Chi Tiết Hồ Sơ Cá Nhân</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dữ liệu được lưu trữ an toàn trong PostgreSQL và sử dụng khi tham gia khảo thí trực tuyến.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer"
                leftIcon={<Pencil className="w-3.5 h-3.5" />}
              >
                Chỉnh Sửa Thông Tin
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Họ và tên thí sinh</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{fullname || 'Chưa cập nhật'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Địa chỉ Email</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block font-mono truncate">{email}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Số điện thoại liên lạc</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{phone || 'Chưa cập nhật'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Khối lớp học tập</span>
                <span className="text-sm font-bold text-[#007D99] dark:text-[#00B8DD] mt-1 block">{grade}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Trường THPT</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block truncate">{school}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Tỉnh / Thành phố</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">{city}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Mã học sinh định danh</span>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono mt-1 block">HS-2026-8899</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium block">Số dư Kim Cương hiện tại</span>
                <span className="text-sm font-bold text-[#007D99] dark:text-[#00B8DD] mt-1 flex items-center gap-1 font-mono">
                  <Gem className="w-4 h-4 fill-[#00B8DD]" /> {diamonds} 💎
                </span>
              </div>
            </div>
          </Card>

          {/* Card 2: Kỳ thi mục tiêu (Bấm trực tiếp chuyển đổi) */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 rounded-3xl space-y-4 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-500" />
                  <span>Kỳ Thi Mục Tiêu GDPT 2018</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ma trận đề thi và gợi ý luyện tập sẽ được cá nhân hóa theo mục tiêu bạn chọn.
                </p>
              </div>
              <span className="text-xs text-[#007D99] dark:text-[#00B8DD] font-bold">
                ✓ Bấm vào thẻ để chuyển đổi ngay
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                { id: 'DGNL_HCM', name: 'ĐGNL ĐHQG TP.HCM', sub: 'Thang điểm chuẩn 1200' },
                { id: 'DGNL_HN', name: 'ĐGNL ĐHQG Hà Nội (HSA)', sub: 'Thang điểm chuẩn 150' },
                { id: 'THPT_QG', name: 'Tốt Nghiệp THPT 2026', sub: 'Chương trình GDPT 2018' },
              ].map((target) => {
                const isSelected = targetExam === target.id;
                return (
                  <button
                    key={target.id}
                    type="button"
                    onClick={() => {
                      setTargetExam(target.id);
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 2500);
                    }}
                    className={cn(
                      'p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
                      isSelected
                        ? 'border-[#00B8DD] bg-[#E6F8FC]/80 dark:bg-cyan-950/40 ring-2 ring-[#00B8DD] shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{target.name}</span>
                      {isSelected && <Badge variant="primary" className="bg-[#00B8DD] text-[10px] text-white">Đang chọn</Badge>}
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2">{target.sub}</span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* ── POPUP DIALOG CHỈNH SỬA HỒ SƠ ── */}
          <Dialog
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title={<span className="text-lg font-black text-slate-900 dark:text-white">Chỉnh Sửa Hồ Sơ Thí Sinh</span>}
            description="Cập nhật họ tên, ảnh đại diện, số điện thoại và khối lớp trực tiếp vào cơ sở dữ liệu."
            maxWidth="lg"
          >
            <form onSubmit={handleSaveProfile} className="space-y-5 pt-2">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Quản lý Avatar */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Ảnh đại diện tài khoản:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleUploadClick}
                      className="h-8 text-xs font-bold rounded-xl"
                      leftIcon={<Upload className="w-3.5 h-3.5 text-[#00B8DD]" />}
                    >
                      Tải ảnh từ máy
                    </Button>
                    {originalAvatar && avatarUrl !== originalAvatar && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setAvatarUrl(originalAvatar)}
                        className="h-8 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-bold rounded-xl"
                        leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      >
                        Về ảnh gốc
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative group shrink-0">
                    <Avatar src={avatarUrl} alt={fullname} size="lg" className="w-16 h-16 rounded-2xl border-2 border-[#00B8DD] object-cover shadow-sm" />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <span className="text-[11px] text-slate-400 block font-medium">Chọn nhanh avatar có sẵn hoặc ảnh gốc:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {originalAvatar && (
                        <button
                          type="button"
                          onClick={() => setAvatarUrl(originalAvatar)}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            avatarUrl === originalAvatar
                              ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 ring-2 ring-[#00B8DD]'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <Avatar src={originalAvatar} alt="Ảnh gốc" size="sm" className="w-8 h-8 object-cover" />
                          <span className="text-[9px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">Ảnh gốc</span>
                        </button>
                      )}

                      {PRESET_AVATARS.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(item.url)}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            avatarUrl === item.url
                              ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/20 ring-2 ring-[#00B8DD]'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <Avatar src={item.url} alt={item.name} size="sm" className="w-8 h-8 object-cover" />
                          <span className="text-[9px] text-slate-600 dark:text-slate-400 truncate w-full text-center">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Họ và tên thí sinh <span className="text-rose-500">*</span></label>
                  <Input value={fullname} onChange={(e) => setFullname(e.target.value)} leftIcon={<User className="w-4 h-4 text-[#00B8DD]" />} required />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Địa chỉ Email <span className="text-slate-400 font-normal">(Cố định)</span></label>
                  <Input value={email} disabled leftIcon={<Mail className="w-4 h-4 text-slate-400" />} className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 cursor-not-allowed font-mono text-xs" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Số điện thoại liên hệ</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} leftIcon={<Phone className="w-4 h-4 text-[#00B8DD]" />} placeholder="0912 345 678" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Khối lớp</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#00B8DD]"
                  >
                    {['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Trường THPT Đang Học</label>
                  <Input value={school} onChange={(e) => setSchool(e.target.value)} leftIcon={<Building className="w-4 h-4 text-[#00B8DD]" />} />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tỉnh / Thành phố</label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} leftIcon={<MapPin className="w-4 h-4 text-[#00B8DD]" />} />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)} className="rounded-xl text-xs font-bold">
                  Hủy Bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs px-5 rounded-xl shadow-md cursor-pointer disabled:opacity-60"
                  leftIcon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                >
                  {isSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}
                </Button>
              </div>
            </form>
          </Dialog>
        </div>
      )}

      {/* ── TAB 2: Exam History & Bloom Matrix Report ── */}
      {activeTab === 'exams' && <PracticeHistoryList showHeader={false} />}

      {/* ── TAB 3: My Courses ── */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00B8DD]" />
                <span>Khóa Học Số Của Bạn</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các chuyên đề luyện thi và bài giảng theo chương trình GDPT 2018 bạn đã đăng ký.
              </p>
            </div>
            <Link href="/student/my-courses">
              <Button variant="outline" size="sm" className="text-xs font-bold rounded-xl cursor-pointer">
                Tất Cả Khóa Học
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {myCourses.map((c) => (
              <Card key={c.id} className="overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between group hover:border-[#00B8DD]/40 transition-all">
                <div>
                  <div className="h-40 w-full overflow-hidden relative">
                    <img
                      src={c.thumb}
                      alt={c.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">
                      {c.completedLessons}/{c.totalLessons} bài học
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold block">
                      {c.author}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                      {c.title}
                    </h4>
                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Tiến độ hoàn thành</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{c.progress}%</span>
                      </div>
                      <Progress value={c.progress} className="h-2 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link href={`/student/learn/${c.id}/l1`}>
                    <Button className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs py-2 rounded-xl cursor-pointer">
                      Tiếp Tục Học Ngay
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: Wallet & Rewards ── */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Diamond Card */}
            <Card className="p-6 rounded-3xl border-cyan-500/30 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/30 dark:to-slate-900 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#007D99] dark:text-[#00B8DD] uppercase tracking-wider">
                  Ví Kim Cương Của Bạn
                </span>
                <Gem className="w-6 h-6 text-cyan-500 fill-cyan-400 animate-pulse" />
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 dark:text-white">
                  {diamonds} <span className="text-lg font-bold text-cyan-500">💎</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Kim cương tích lũy khi nộp bài thi ma trận đạt điểm cao và hoàn thành chuỗi rèn luyện.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs">
                    Nạp Thêm Kim Cương
                  </Button>
                </Link>
                <Link href="/student/rewards" className="flex-1">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl cursor-pointer">
                    Đổi Quà Tặng
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Reward History */}
            <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>Lịch Sử Nhận & Đổi Thưởng Gần Nhất</span>
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Hoàn thành Đề Toán 11 (9.2 điểm)</span>
                    <span className="text-[10px] text-slate-400">10/10/2026</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">+50 💎</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Chuỗi 5 ngày luyện thi liên tiếp</span>
                    <span className="text-[10px] text-slate-400">09/10/2026</span>
                  </div>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">+30 💎</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Đổi huy hiệu Chiến Thần Ma Trận</span>
                    <span className="text-[10px] text-slate-400">04/10/2026</span>
                  </div>
                  <span className="font-black text-rose-500">-100 💎</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 5: Security & Password ── */}
      {activeTab === 'security' && (
        <Card className="max-w-xl p-6 border-slate-200 dark:border-slate-800 rounded-3xl space-y-6 bg-white dark:bg-slate-900 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#00B8DD]" />
              <span>Bảo Mật & Đổi Mật Khẩu</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Khuyến nghị đặt mật khẩu có ít nhất 8 ký tự bao gồm chữ số và ký tự đặc biệt.
            </p>
          </div>

          {passwordSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Đổi mật khẩu tài khoản thành công!</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mật khẩu hiện tại
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Mật khẩu mới
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
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
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-xs"
            >
              Cập Nhật Mật Khẩu Mới
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
