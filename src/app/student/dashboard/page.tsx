'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Calendar,
  Award,
  Play,
  ArrowRight,
  Clock,
  MessageSquare,
  Trophy,
  CheckCircle2,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  Filter,
  TrendingUp,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Landmark,
  Globe,
  Scale,
  Cpu,
  Wrench,
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Tabs } from '@/components/ui/tabs';
import { MOCK_COURSES, MOCK_TIMETABLE, MOCK_EXAMS, K12_SUBJECTS } from '@/services/mock/data';
import { K12Subject } from '@/types/subject';
import { LevelSelectionModal } from '@/components/features/student/practice/LevelSelectionModal';
import { cn } from '@/lib/utils';

// Helper icon mapping for subjects
const SUBJECT_ICON_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Languages: <Languages className="w-6 h-6" />,
  Atom: <Atom className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Dna: <Dna className="w-6 h-6" />,
  Landmark: <Landmark className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
};

export default function StudentDashboardPage() {
  const [activeCategory, setActiveCategory] = React.useState('ALL');
  const [selectedSubject, setSelectedSubject] = React.useState<K12Subject | null>(null);
  const [isLevelModalOpen, setIsLevelModalOpen] = React.useState(false);

  const ongoingCourse = MOCK_COURSES[0];
  const nextSession = MOCK_TIMETABLE[0];

  const categoryTabs = [
    { id: 'ALL', label: 'Tất Cả Môn (11 Môn)', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'NATURAL', label: 'Khoa Học Tự Nhiên', icon: <Atom className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'SOCIAL', label: 'Khoa Học Xã Hội', icon: <BookOpen className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'LANGUAGE', label: 'Ngoại Ngữ', icon: <Languages className="w-3.5 h-3.5 text-sky-500" /> },
    { id: 'TECH', label: 'Tin Học & Kỹ Thuật', icon: <Cpu className="w-3.5 h-3.5 text-indigo-500" /> },
  ];

  const filteredSubjects = React.useMemo(() => {
    if (activeCategory === 'ALL') return K12_SUBJECTS;
    return K12_SUBJECTS.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const handleOpenSubjectLevels = (subject: K12Subject) => {
    setSelectedSubject(subject);
    setIsLevelModalOpen(true);
  };

  const teacherAnnouncements = [
    {
      id: 'ann-1',
      teacher: 'ThS. Nguyễn Văn Hùng',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      subject: 'Toán Học 11',
      title: 'Nhắc nhở lớp 11A1 chuẩn bị bài tập Lượng Giác',
      content: 'Các em nhớ làm xong 5 câu trắc nghiệm Bài 02 trước 22h tối nay để thầy tổng hợp điểm cộng nhé!',
      time: '30 phút trước',
    },
    {
      id: 'ann-2',
      teacher: 'Cô Sarah Trần',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      subject: 'IELTS Writing',
      title: 'Đã trả điểm bài luận IELTS Task 2',
      content: 'Cô đã chấm xong bài tự luận của Minh. Bài viết dùng từ vựng linh hoạt, chú ý sửa lỗi dùng thì quá khứ.',
      time: '2 giờ trước',
    },
  ];

  const classLeaderboard = [
    { rank: 1, name: 'Trần Hoàng Nam', points: 1250, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80', badge: '🥇 Top 1' },
    { rank: 2, name: 'Nguyễn Hoàng Minh (Bạn)', points: 850, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', isSelf: true, badge: '🥈 Top 2' },
    { rank: 3, name: 'Lê Thu Thảo', points: 810, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', badge: '🥉 Top 3' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* ── 1. Gamification Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A1E38] via-[#007D99] to-[#00B8DD] p-6 sm:p-8 text-white shadow-xl shadow-[#00B8DD]/15 border border-cyan-500/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold hover:bg-[#009BBD]">
                Khối 11 - Lớp 11A1
              </Badge>
              <span className="text-xs text-cyan-100 font-medium">THPT Chuyên Công Nghệ Schoolify</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Chào Minh, Chúc Bạn Học Tập Hiệu Quả! 👋
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 mt-2 max-w-xl leading-relaxed">
              Bạn đang đứng thứ <strong className="text-amber-300">#2 Bảng Xếp Hạng Lớp 11A1</strong>. Chọn môn học bên dưới để làm bài tập phân tầng từ Cơ bản đến HSG Quốc gia nhé!
            </p>
          </div>

          {/* Gamification Points Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 flex items-center gap-4 shrink-0 shadow-md">
            <div className="h-12 w-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-2xl shadow-inner">
              💎
            </div>
            <div>
              <span className="text-[11px] text-cyan-100 uppercase font-bold tracking-wider">Điểm Rèn Luyện</span>
              <p className="text-2xl font-black text-white">850 Điểm</p>
              <Link href="/student/store" className="text-xs text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1">
                <span>Đổi quà tại Store</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. CORE FEATURE: Tất Cả Các Môn Học K-12 (Grid View) ── */}
      <div className="space-y-5">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#00B8DD]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#00B8DD]">
              Kho Luyện Thi Phân Tầng
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Tất Cả Môn Học K-12
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Nhấn vào môn học để chọn cấp độ: <strong>Cơ bản</strong>, <strong>Trung bình</strong>, <strong>Nâng cao</strong>, <strong>HSG Tỉnh</strong> hoặc <strong>HSG Quốc gia</strong>.
          </p>
        </div>

        {/* Filter tabs moved below title */}
        <div className="overflow-x-auto no-scrollbar pt-1 pb-1">
          <Tabs
            tabs={categoryTabs}
            activeTab={activeCategory}
            onChange={setActiveCategory}
            className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs"
          />
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredSubjects.map((subject) => {
            const icon = SUBJECT_ICON_MAP[subject.iconName] || <BookOpen className="w-6 h-6" />;
            return (
              <Card
                key={subject.id}
                onClick={() => handleOpenSubjectLevels(subject)}
                className="group p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/70 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn('p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300', subject.bgLight, subject.themeColor)}>
                      {icon}
                    </div>
                    <Badge variant="outline" className="text-[11px] font-bold border-slate-200 dark:border-slate-700">
                      K-12
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#00B8DD] transition-colors line-clamp-1">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {subject.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#00B8DD]" />
                      <strong>5</strong> cấp độ
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <strong>{subject.totalExams.toLocaleString()}</strong> đề thi
                    </span>
                  </div>

                  {/* Cấp độ available tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['Cơ bản', 'Trung bình', 'Nâng cao'].map((lvl) => (
                      <span key={lvl} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {lvl}
                      </span>
                    ))}
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] font-bold">
                      +2 HSG
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-end text-xs font-bold text-[#007D99] dark:text-[#00B8DD] group-hover:translate-x-1 transition-transform">
                    <span>Luyện ngay</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── 3. Main Dashboard Layout (Learning Tasks, Timetable, Exams & Feedback) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Learning Tasks & Teacher Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Widget 1: Tiếp tục học tập */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Tiếp Tục Khóa Học</span>
              </h3>
              <Link href="/student/my-courses">
                <Button size="sm" variant="ghost" className="text-xs text-[#007D99] dark:text-[#00B8DD]">
                  Tất cả khóa học ({MOCK_COURSES.length})
                </Button>
              </Link>
            </div>

            {ongoingCourse && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-800">
                      {ongoingCourse.department_name}
                    </Badge>
                    <span className="text-xs text-slate-500">Giảng viên: {ongoingCourse.teacher_name}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {ongoingCourse.title}
                  </h4>
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-36 sm:w-48">
                      <Progress value={45} className="h-2" />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">45% hoàn thành</span>
                  </div>
                </div>

                <Link href={`/student/learn/${ongoingCourse.id}/ls-01`} className="shrink-0">
                  <Button size="sm" className="bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-bold" leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}>
                    Học Tiếp
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Widget 2: Thông Báo & Nhận Xét Từ Giáo Viên */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>Thông Báo & Nhận Xét Từ Thầy Cô</span>
              </h3>
              <Badge variant="success" className="text-[10px]">2 tin mới</Badge>
            </div>

            <div className="space-y-3">
              {teacherAnnouncements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar src={ann.avatar} alt={ann.teacher} size="sm" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ann.teacher}</h5>
                        <span className="text-[10px] text-slate-400">{ann.subject} • {ann.time}</span>
                      </div>
                    </div>
                  </div>
                  <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">{ann.title}</h6>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{ann.content}"
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Widget 3: Bài Thi & Khảo Thí */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <Award className="w-4 h-4" />
                </div>
                <span>Bài Tập & Khảo Thí Cần Làm</span>
              </h3>
              <Link href="/student/exams">
                <Button size="sm" variant="ghost" className="text-xs text-slate-500">Xem tất cả</Button>
              </Link>
            </div>

            <div className="space-y-3">
              {MOCK_EXAMS.map((exam) => (
                <div key={exam.id} className="p-4 rounded-2xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="warning" className="text-[10px] font-bold">
                        Thời gian: {exam.duration_minutes} phút
                      </Badge>
                      <span className="text-[11px] text-slate-500">Hạn chót: 23:59 Tối Nay</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exam.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Hình thức: 40 Câu Trắc Nghiệm + Tự Luận</p>
                  </div>
                  <Link href={`/student/exam/${exam.id}`}>
                    <Button size="sm" variant="primary" className="shrink-0">
                      Vào Làm Bài Thi
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Timetable & Class Leaderboard */}
        <div className="space-y-6">
          {/* Widget 4: Lịch Học Trực Tiếp Hôm Nay */}
          {nextSession && (
            <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD]">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Lịch Học Hôm Nay</span>
              </h3>

              <div className="p-4 rounded-2xl bg-[#E6F8FC]/50 dark:bg-[#00B8DD]/10 border border-[#00B8DD]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    08:00 - 09:45
                  </span>
                  <Badge variant="outline" className="text-[10px] border-[#00B8DD] text-[#007D99]">Zoom Online</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{nextSession.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Giảng viên: {nextSession.teacher_name}</p>
                  <p className="text-xs text-slate-500">Phòng học: {nextSession.room}</p>
                </div>
                <a href={nextSession.meeting_url || '#'} target="_blank" rel="noreferrer" className="block pt-1">
                  <Button size="sm" className="w-full justify-center bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-bold" leftIcon={<ExternalLink className="w-4 h-4" />}>
                    Vào Phòng Học Online
                  </Button>
                </a>
              </div>
            </Card>
          )}

          {/* Widget 5: Bảng Xếp Hạng Thi Đua Lớp 11A1 */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <Trophy className="w-4 h-4" />
                </div>
                <span>Bảng Xếp Hạng Lớp 11A1</span>
              </h3>
              <span className="text-xs text-slate-400">Tuần này</span>
            </div>

            <div className="space-y-3">
              {classLeaderboard.map((item) => (
                <div
                  key={item.rank}
                  className={cn(
                    'p-3 rounded-2xl flex items-center justify-between transition-all',
                    item.isSelf
                      ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-2 border-[#00B8DD]'
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-500 w-5 text-center">#{item.rank}</span>
                    <Avatar src={item.avatar} alt={item.name} size="sm" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{item.name}</h5>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{item.badge}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.points} 💎</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link href="/student/rewards" className="text-xs text-[#007D99] dark:text-[#00B8DD] font-semibold hover:underline">
                Xem toàn bộ bảng xếp hạng trường →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ── 4. Level Selection Modal (Opens on subject click) ── */}
      <LevelSelectionModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        subject={selectedSubject}
      />
    </div>
  );
}
