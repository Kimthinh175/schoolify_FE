'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  BookOpen,
  FileText,
  MessageSquare,
  ArrowLeft,
  Clock,
  Target,
  Gift,
  Timer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_COURSES } from '@/services/mock/data';

export default function FocusLearningPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const course = MOCK_COURSES.find((c) => c.id === params.courseId) || MOCK_COURSES[0];
  const [completedLessons, setCompletedLessons] = React.useState<string[]>(['ls-01']);

  const toggleComplete = (id: string) => {
    setCompletedLessons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Thanh Header Điều Hướng */}
      <header className="h-14 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Rời Không Gian Học</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-xs sm:text-sm font-bold truncate max-w-md">
            {course.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-[10px]">
            {completedLessons.length}/{course.total_lessons} bài hoàn thành
          </Badge>
        </div>
      </header>

      {/* Khu Vực Chính: Video & Cột Phải */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Trái: Trình Phát Video & Chi Tiết Bài Học */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-black p-4 sm:p-6 space-y-6">
          {/* Khung Chứa Video */}
          <div className="relative aspect-video w-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-2xl border border-slate-800">
            <video
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              controls
              className="w-full h-full object-cover"
            />
          </div>

          {/* Nội Dung & Thao Tác Bài Học */}
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  Bài 1: Giá trị lượng giác của góc lượng giác & Công thức cốt lõi
                </h1>
                <p className="text-xs text-slate-400 mt-1">Giảng dạy bởi: {course.teacher_name}</p>
              </div>

              <Button
                onClick={() => toggleComplete('ls-01')}
                variant={completedLessons.includes('ls-01') ? 'success' : 'outline'}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                {completedLessons.includes('ls-01') ? 'Đã Hoàn Thành' : 'Đánh Dấu Đã Học'}
              </Button>
            </div>

            {/* Tải Xuống Tài Liệu */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                Tài Liệu Đính Kèm Của Bài Học
              </h4>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-[10px]">PDF</Badge>
                  <span className="text-xs font-semibold">Tong_Hop_Cong_Thuc_Luong_Giac_11.pdf (2.4 MB)</span>
                </div>
                <Button size="sm" variant="ghost" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Tải Xuống
                </Button>
              </div>
            </div>

            {/* Thẻ Bài Thi Cuối Bài */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 space-y-4 shadow-lg shadow-indigo-900/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Timer className="w-5 h-5 text-amber-400" />
                    Bài Thi Đánh Giá Cuối Bài
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Hoàn thành bài thi để mở khóa bài học tiếp theo và nhận thưởng.
                  </p>
                </div>
                <Badge variant="primary" className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold whitespace-nowrap">
                  Thưởng +30 💎
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                  <Clock className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium">Thời gian</span>
                  <strong className="text-sm text-white font-bold">30 Phút</strong>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                  <FileText className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium">Số lượng</span>
                  <strong className="text-sm text-white font-bold">15 Câu</strong>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                  <Target className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium">Điểm đạt</span>
                  <strong className="text-sm text-white font-bold">7.0+</strong>
                </div>
                <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/80 flex flex-col items-center justify-center text-center">
                  <Gift className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-[10px] text-slate-500 font-medium">Phần thưởng</span>
                  <strong className="text-sm text-amber-400 font-bold">+30 💎</strong>
                </div>
              </div>

              <div className="relative z-10 pt-2">
                <Link href="/student/exam/ex-01" className="block">
                  <Button className="w-full h-12 text-base font-bold bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.01] border-0" rightIcon={<ChevronRight className="w-5 h-5" />}>
                    Bắt Đầu Làm Bài Thi Tính Giờ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải: Danh Sách Bài Giảng / Khóa Học */}
        <div className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-auto lg:h-[calc(100vh-3.5rem)] overflow-y-auto">
          <div className="p-4 border-b border-slate-800 font-bold text-sm">
            Nội Dung Khóa Học ({course.total_lessons} Bài)
          </div>

          <div className="divide-y divide-slate-800/80">
            {course.chapters?.[0]?.lessons.map((lesson, idx) => (
              <div
                key={lesson.id}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  idx === 0 ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold text-slate-500 mt-0.5">{idx + 1}.</span>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2">{lesson.title}</p>
                    <span className="text-[10px] text-slate-500">{lesson.duration_mins} phút</span>
                  </div>
                </div>
                {completedLessons.includes(lesson.id) && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
