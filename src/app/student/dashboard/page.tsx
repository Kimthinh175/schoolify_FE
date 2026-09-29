'use client';

import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Award,
  Play,
  ArrowRight,
  Clock,
  MessageSquare,
  Trophy,
  CheckCircle2,
  FileText,
  Pin,
  Flame,
  User,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { MOCK_COURSES, MOCK_TIMETABLE, MOCK_EXAMS } from '@/services/mock/data';

export default function StudentDashboardPage() {
  const ongoingCourse = MOCK_COURSES[0];
  const nextSession = MOCK_TIMETABLE[0];

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
    { rank: 2, name: 'Võ Ngọc Minh (Bạn)', points: 850, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80', isSelf: true, badge: '🥈 Top 2' },
    { rank: 3, name: 'Lê Thu Thảo', points: 810, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', badge: '🥉 Top 3' },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* ── Welcome Banner (Style Chuẩn Schoolify Cyan & Deep Ocean) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0A1E38] via-[#007D99] to-[#00B8DD] p-6 sm:p-8 text-white shadow-lg border border-cyan-500/20">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold hover:bg-[#009BBD]">
                Lớp 11A1 • Niên Khóa 2025-2026
              </Badge>
              <span className="text-xs text-cyan-100 font-medium">THPT Chuyên Công Nghệ Schoolify</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Chào Minh, Chúc Bạn Học Tốt Hôm Nay! 🎓
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 mt-2 max-w-xl leading-relaxed">
              Bạn đang đứng thứ <strong className="text-amber-300">#2 Bảng Xếp Hạng Lớp 11A1</strong>. Hôm nay bạn có 1 buổi học online lúc 08:00 và 1 bài tập về nhà cần nộp.
            </p>
          </div>

          {/* Gamification Wallet Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 flex items-center gap-4 shrink-0 shadow-md">
            <div className="h-12 w-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-2xl shadow-inner">
              💎
            </div>
            <div>
              <span className="text-[11px] text-cyan-100 uppercase font-bold tracking-wider">Điểm Rèn Luyện</span>
              <p className="text-2xl font-black text-white">850 Điểm</p>
              <Link href="/student/store" className="text-xs text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1">
                <span>Đổi vật phẩm store</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Dashboard Layout ── */}
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
                <span>Tiếp Tục Tiến Độ Học Tập</span>
              </h3>
              <Link href="/student/my-courses">
                <Button size="sm" variant="ghost" className="text-xs text-[#007D99] dark:text-[#00B8DD]">
                  Tất cả khóa học ({MOCK_COURSES.length})
                </Button>
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 dark:border-slate-700">
                  <img src={ongoingCourse.thumbnail_url || ''} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <Badge variant="secondary" className="text-[10px] mb-1 font-semibold text-[#007D99]">
                    {ongoingCourse.department_name}
                  </Badge>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ongoingCourse.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Bài 02 - Phương Trình Lượng Giác Bậc Hai
                  </p>
                  <div className="mt-2.5 w-48 sm:w-56">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Tiến độ bài học</span>
                      <span className="text-[#00B8DD]">65%</span>
                    </div>
                    <Progress value={65} showLabel={false} className="h-2" />
                  </div>
                </div>
              </div>

              <Link href="/student/practice/toan-hoc/lop-11/lesson-02">
                <Button size="sm" variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                  Vào Học Tiếp
                </Button>
              </Link>
            </div>
          </Card>

          {/* Widget 2: Thông Báo & Lời Nhắc Từ Thầy Cô */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                  <Pin className="w-4 h-4" />
                </div>
                <span>Lời Nhắn & Nhắc Nhở Từ Thầy Cô</span>
              </h3>
              <Badge variant="warning" className="text-[10px] font-bold">2 Lời nhắn mới</Badge>
            </div>

            <div className="space-y-3">
              {teacherAnnouncements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-[#00B8DD]/40 transition-all">
                  <div className="flex items-start gap-3">
                    <Avatar src={ann.avatar} alt={ann.teacher} size="md" className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">{ann.teacher}</h5>
                          <span className="text-[11px] text-[#007D99] dark:text-[#00B8DD] font-semibold">• {ann.subject}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{ann.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{ann.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                        "{ann.content}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Widget 3: Bài kiểm tra & Hạn nộp bài tập */}
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Bài Kiểm Tra & Hạn Nộp Sắp Tới</span>
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
          <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD]">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Lịch Học Trực Tiếp Hôm Nay</span>
            </h3>

            <div className="p-4 rounded-2xl bg-[#E6F8FC]/50 dark:bg-[#00B8DD]/10 border border-[#00B8DD]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  08:00 - 09:45 (Sắp diễn ra)
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
                  className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                    item.isSelf
                      ? 'bg-[#E6F8FC] dark:bg-[#00B8DD]/20 border-2 border-[#00B8DD]'
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800'
                  }`}
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
    </div>
  );
}

