'use client';

import Link from 'next/link';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  ShoppingBag,
  Play,
  ArrowRight,
  Gift,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MOCK_COURSES, MOCK_TIMETABLE, MOCK_EXAMS } from '@/services/mock/data';

export default function StudentDashboardPage() {
  const ongoingCourse = MOCK_COURSES[0];
  const nextSession = MOCK_TIMETABLE[0];

  return (
    <div className="space-y-8">
      {/* Gamification Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" className="bg-white/20 text-white font-bold backdrop-blur-xs">
                Khối 11 - Lớp 11A1
              </Badge>
              <span className="text-xs text-indigo-200">THPT Chuyên Công Nghệ Schoolify</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Chào Minh, Chúc Bạn Học Tập Hiệu Quả! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 mt-1 max-w-lg">
              Bạn có 1 buổi học trực tiếp vào lúc 08:00 sáng nay và 1 bài kiểm tra lượng giác cần hoàn thành.
            </p>
          </div>

          {/* Points Card */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 flex items-center gap-4 shrink-0">
            <div className="h-12 w-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xl shadow-md">
              💎
            </div>
            <div>
              <span className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Điểm Tích Lũy</span>
              <p className="text-2xl font-black">850 Điểm</p>
              <Link href="/student/rewards" className="text-xs text-amber-300 hover:underline font-semibold">
                Đổi quà tại Store →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Course & Next Session */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Continue Learning */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Tiếp Tục Học Tập
              </h3>
              <Link href="/student/my-courses">
                <Button size="sm" variant="ghost">Tất cả khóa học</Button>
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  <img src={ongoingCourse.thumbnail_url || ''} alt="" className="h-full w-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ongoingCourse.title}</h4>
                  <p className="text-xs text-slate-500">Đang học: Bài 2 - Phương trình lượng giác cơ bản</p>
                  <div className="mt-2 w-48">
                    <Progress value={65} showLabel={false} />
                  </div>
                </div>
              </div>

              <Link href="/student/learn/crs-01/ls-01">
                <Button size="sm" variant="primary" leftIcon={<Play className="w-4 h-4" />}>
                  Học Tiếp
                </Button>
              </Link>
            </div>
          </Card>

          {/* Next Exam Alert */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Bài Thi & Kiểm Tra Sắp Tới
              </h3>
              <Link href="/student/exams">
                <Button size="sm" variant="ghost">Xem tất cả</Button>
              </Link>
            </div>

            {MOCK_EXAMS.map((exam) => (
              <div key={exam.id} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-between">
                <div>
                  <Badge variant="warning" className="text-[10px] mb-1">Thời gian: {exam.duration_minutes} phút</Badge>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exam.title}</h4>
                  <p className="text-xs text-slate-500">Hạn chót nộp bài: 01/09/2026</p>
                </div>
                <Link href={`/student/exam/${exam.id}`}>
                  <Button size="sm" variant="primary">Làm Bài Thi</Button>
                </Link>
              </div>
            ))}
          </Card>
        </div>

        {/* Right Col: Timetable widget */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Lịch Học Trực Tiếp Hôm Nay
            </h3>

            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">08:00 - 09:45 (Sắp diễn ra)</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{nextSession.title}</h4>
              <p className="text-xs text-slate-500">{nextSession.teacher_name} • {nextSession.room}</p>
              <a href={nextSession.meeting_url || '#'} target="_blank" rel="noreferrer" className="block">
                <Button size="sm" className="w-full justify-center" leftIcon={<Play className="w-4 h-4" />}>
                  Vào Phòng Học Online
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
