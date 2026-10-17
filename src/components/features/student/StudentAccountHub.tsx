'use client';

import * as React from 'react';
import Link from 'next/link';
import {
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
  Save,
  Target,
  BarChart3,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Flame,
  Camera,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/lib/utils';
import { PracticeHistoryList } from '@/components/features/student/PracticeHistoryList';

export function StudentAccountHub() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState<'profile' | 'exams' | 'courses' | 'wallet' | 'security'>('profile');

  // Form profile state
  const [fullname, setFullname] = React.useState(user?.fullname || 'Nguyễn Hoàng Minh');
  const [email, setEmail] = React.useState(user?.email || 'student.minh@schoolify.edu.vn');
  const [phone, setPhone] = React.useState('0987 654 321');
  const [school, setSchool] = React.useState('THPT Chuyên Công Nghệ Schoolify');
  const [grade, setGrade] = React.useState('Lớp 11 - Khối 11');
  const [city, setCity] = React.useState('TP. Hồ Chí Minh');
  const [targetExam, setTargetExam] = React.useState('DGNL_HCM');
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordSuccess, setPasswordSuccess] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
      thumb: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80',
    },
    {
      id: 'c-03',
      title: 'Chinh Phục Tiếng Anh THPT - Ngữ Pháp Thực Chiến & Đọc Hiểu Nhanh',
      author: 'Cô Sarah Trần',
      progress: 40,
      completedLessons: 8,
      totalLessons: 20,
      lastAccess: '1 tuần trước',
      thumb: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* -- 1. Hero Account Card -- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A1E38] via-[#007D99] to-[#00B8DD] p-6 sm:p-8 text-white shadow-xl shadow-[#00B8DD]/15 border border-cyan-500/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Avatar & Personal Info */}
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <Avatar
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80'}
                alt={fullname}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white/20 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#0A1E38]" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold hover:bg-[#009BBD] text-[10px]">
                  🎓 NGƯỜI LUYỆN THI
                </Badge>
                <span className="text-xs text-cyan-200 font-medium">Mã HS: HS-2026-8899</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {fullname}
              </h1>
              <p className="text-xs text-cyan-100 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-cyan-300" /> {school}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-300" /> Mục tiêu: ĐGNL & Tốt Nghiệp THPT
                </span>
              </p>
            </div>
          </div>

          {/* Right: Fast Action CTA to Exam Practice */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch md:items-end gap-3 shrink-0">
            <Link
              href="/luyen-thi"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/30 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Vào Luyện Thi Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white">
              <Gem className="w-4 h-4 text-cyan-300 fill-cyan-300" />
              <span>850 Kim Cương</span>
            </div>
          </div>
        </div>
      </div>

      {/* -- 2. Quick Metrics Row -- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Đề Thi Đã Luyện</span>
            <div className="h-8 w-8 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">24</span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+4 đề tuần này</span>
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">8.4</span>
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
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">khóa học số</span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chuỗi Luyện Tập</span>
            <div className="h-8 w-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">5 Ngày</span>
            <span className="text-xs text-rose-500 font-bold">Liên tiếp 🔥</span>
          </div>
        </Card>
      </div>

      {/* -- 3. Navigation Tabs -- */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'profile'
              ? 'bg-[#00B8DD] text-slate-950 shadow-md shadow-[#00B8DD]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <User className="w-4 h-4" />
          <span>Hồ Sơ & Mục Tiêu Ôn Thi</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'exams'
              ? 'bg-[#00B8DD] text-slate-950 shadow-md shadow-[#00B8DD]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Lịch Sử Luyện Đề & Ma Trận</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">4</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'courses'
              ? 'bg-[#00B8DD] text-slate-950 shadow-md shadow-[#00B8DD]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <BookOpen className="w-4 h-4" />
          <span>Khóa Học Của Tôi</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">3</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'wallet'
              ? 'bg-[#00B8DD] text-slate-950 shadow-md shadow-[#00B8DD]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Gem className="w-4 h-4" />
          <span>Ví Kim Cương & Đổi Quà</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer',
            activeTab === 'security'
              ? 'bg-[#00B8DD] text-slate-950 shadow-md shadow-[#00B8DD]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Lock className="w-4 h-4" />
          <span>Bảo Mật & Mật Khẩu</span>
        </button>
      </div>

      {/* -- 4. Tab Contents -- */}
      {/* -- TAB 1: Profile & Target Exam -- */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>Đã lưu thành công thông tin hồ sơ và mục tiêu ôn thi của bạn!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-[#00B8DD]" />
                  <span>Thông Tin Cá Nhân & Liên Hệ</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Thông tin này dùng để hiển thị trên chứng nhận điểm thi và trao đổi với giáo viên.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Họ và tên thí sinh
                  </label>
                  <Input
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    leftIcon={<User className="w-4 h-4 text-[#00B8DD]" />}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Địa chỉ Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    leftIcon={<Mail className="w-4 h-4 text-[#00B8DD]" />}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Số điện thoại liên hệ
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    leftIcon={<Phone className="w-4 h-4 text-[#00B8DD]" />}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tỉnh / Thành phố
                  </label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    leftIcon={<MapPin className="w-4 h-4 text-[#00B8DD]" />}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-500" />
                  <span>Trường Học & Mục Tiêu Luyện Thi</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hệ thống ma trận Schoolify sẽ tự động tối ưu hóa đề thi phù hợp với mục tiêu của bạn.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Trường THPT Đang Học
                  </label>
                  <Input
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    leftIcon={<Building className="w-4 h-4 text-amber-500" />}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Lớp & Khối
                  </label>
                  <Input
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    leftIcon={<GraduationCap className="w-4 h-4 text-amber-500" />}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kỳ Thi Mục Tiêu Chính
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'DGNL_HCM', name: 'ĐGNL ĐHQG TP.HCM', sub: 'Thang điểm 1200' },
                    { id: 'DGNL_HN', name: 'ĐGNL ĐHQG Hà Nội (HSA)', sub: 'Thang điểm 150' },
                    { id: 'THPT_QG', name: 'Tốt Nghiệp THPT 2026', sub: 'Chương trình GDPT 2018' },
                  ].map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => setTargetExam(target.id)}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                        targetExam === target.id
                          ? 'border-[#00B8DD] bg-[#E6F8FC]/50 dark:bg-cyan-950/30 ring-2 ring-[#00B8DD]/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                      )}
                    >
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{target.name}</span>
                      <span className="text-[11px] text-slate-400 mt-1">{target.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-md cursor-pointer"
                  leftIcon={<Save className="w-4 h-4" />}
                >
                  Lưu Thay Đổi Hồ Sơ
                </Button>
              </div>
            </Card>
          </form>
        </div>
      )}

      {/* -- TAB 2: Exam History & Bloom Matrix Report -- */}
      {activeTab === 'exams' && <PracticeHistoryList />}

      {/* -- TAB 3: My Courses -- */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Khóa Học Số Của Bạn
              </h3>
              <p className="text-xs text-slate-500">
                Các bài giảng chuyên sâu do giáo viên và creator Schoolify xuất bản mà bạn đã sở hữu.
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
              <Card key={c.id} className="overflow-hidden rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between group">
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
                    <Button className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold text-xs py-2 rounded-xl cursor-pointer">
                      Tiếp Tục Học Ngay
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* -- TAB 4: Wallet & Rewards -- */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Diamond Card */}
            <Card className="p-6 rounded-3xl border-cyan-500/30 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/30 dark:to-slate-900 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#007D99] dark:text-[#00B8DD] uppercase tracking-wider">
                  Ví Kim Cương Cá Nhân
                </span>
                <Gem className="w-6 h-6 text-cyan-500 fill-cyan-400 animate-pulse" />
              </div>
              <div>
                <p className="text-4xl font-black text-slate-900 dark:text-white">
                  850 <span className="text-lg font-bold text-cyan-500">💎</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Kim cương tích lũy khi giải đúng câu hỏi và hoàn thành đề thi ma trận.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-3">
                <Link href="/pricing" className="flex-1">
                  <Button className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold text-xs rounded-xl cursor-pointer">
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
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-500" />
                <span>Lịch Sử Nhận & Đổi Thưởng</span>
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

      {/* -- TAB 5: Security & Password -- */}
      {activeTab === 'security' && (
        <Card className="max-w-xl p-6 border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
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
              className="w-full bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold py-2.5 rounded-xl cursor-pointer"
            >
              Cập Nhật Mật Khẩu Mới
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
