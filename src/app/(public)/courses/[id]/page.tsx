'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  BookOpen,
  Clock,
  User,
  Star,
  FileText,
  Lock,
  QrCode,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { MOCK_COURSES } from '@/services/mock/data';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEnrollModalOpen, setIsEnrollModalOpen] = React.useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = React.useState(false);

  const course = MOCK_COURSES.find((c) => c.id === params.id) || MOCK_COURSES[0];

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Quay lại Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Info & Curriculum */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge variant="purple" className="mb-2">{course.department_name}</Badge>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
              {course.title}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {course.description}
            </p>

            {/* Meta info */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                <span className="font-bold">{course.rating}</span>
                <span>({course.total_reviews} đánh giá)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{course.total_students} học viên đã đăng ký</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Cập nhật mới nhất 08/2026</span>
              </div>
            </div>
          </div>

          {/* Teacher Profile Card */}
          <Card className="p-4 flex items-center gap-4 bg-slate-50/70 dark:bg-slate-900/60">
            <Avatar src={course.teacher_avatar} alt={course.teacher_name} size="lg" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Giảng viên phụ trách</p>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">{course.teacher_name}</h4>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{course.department_name}</p>
            </div>
          </Card>

          {/* Curriculum Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Đề Cương Bài Giảng</h2>
              <span className="text-xs text-slate-500">{course.total_lessons} bài học</span>
            </div>

            <div className="space-y-3">
              {course.chapters && course.chapters.length > 0 ? (
                course.chapters.map((chapter) => (
                  <Card key={chapter.id} className="p-0 overflow-hidden">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 font-bold text-sm text-slate-900 dark:text-white">
                      {chapter.title}
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {chapter.lessons.map((lesson) => (
                        <div key={lesson.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                              <Play className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">{lesson.title}</p>
                              <span className="text-xs text-slate-500">{lesson.duration_mins} phút</span>
                            </div>
                          </div>
                          <div>
                            {lesson.is_free_preview ? (
                              <Badge variant="success" className="text-[10px] cursor-pointer">
                                Học Thử Miễn Phí
                              </Badge>
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-slate-500 text-sm">
                  Đề cương chi tiết đang được đồng bộ từ Tổ chuyên môn.
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Sticky Purchase Box & Video Preview */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24 shadow-xl border-indigo-100 dark:border-slate-800">
            {/* Video preview container */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-6">
              <video
                src="https://www.w3schools.com/html/mov_bbb.mp4"
                controls
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-6">
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {formatMoney(course.price)}
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                ✓ Truy cập trọn đời & Cập nhật bài giảng miễn phí
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => setIsEnrollModalOpen(true)}
                className="w-full justify-center h-12 text-base font-bold shadow-lg shadow-indigo-500/20"
              >
                Đăng Ký Mua Khóa Học Ngay
              </Button>
              <Link href="/student/learn/crs-01/ls-01" className="block">
                <Button variant="outline" className="w-full justify-center" leftIcon={<Play className="w-4 h-4" />}>
                  Vào Học Thử Trực Tiếp
                </Button>
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Bao gồm {course.total_lessons} bài giảng video chất lượng cao</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Tài liệu đính kèm file Word/Excel/PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Làm bài kiểm tra & nhận lời phê trực tiếp từ giáo viên</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog
        isOpen={isEnrollModalOpen}
        onClose={() => {
          setIsEnrollModalOpen(false);
          setIsPaidSuccess(false);
        }}
        title={`Mua Khóa Học: ${course.title}`}
        description="Quét mã VietQR để hoàn tất thanh toán và tự động kích hoạt khóa học."
      >
        <div className="py-2 flex flex-col items-center text-center space-y-4">
          {!isPaidSuccess ? (
            <>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=VIETQR-COURSE-PURCHASE-DEMO"
                  alt="VietQR"
                  className="w-48 h-48 rounded-xl object-contain"
                />
              </div>
              <div className="w-full rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-xs space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Học phí thanh toán:</span>
                  <span className="font-bold text-indigo-600 text-sm">{formatMoney(course.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã đơn hàng:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">ORD-CRS-{course.id.toUpperCase()}</span>
                </div>
              </div>
              <Button
                onClick={() => setIsPaidSuccess(true)}
                className="w-full justify-center"
                leftIcon={<QrCode className="w-4 h-4" />}
              >
                Xác Nhận Đã Chuyển Khoản
              </Button>
            </>
          ) : (
            <div className="py-6 flex flex-col items-center space-y-3">
              <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thanh Toán Thành Công!</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Khóa học đã được thêm vào mục <b>"Khóa Học Của Tôi"</b> trong phân hệ Học sinh của bạn.
              </p>
              <Link href="/student/learn/crs-01/ls-01" className="w-full">
                <Button className="w-full justify-center mt-2">Vào Học Ngay</Button>
              </Link>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
