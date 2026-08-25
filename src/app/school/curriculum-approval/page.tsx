'use client';

import * as React from 'react';
import { BookCheck, Check, X, Eye, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_COURSES } from '@/services/mock/data';
import { Course } from '@/types';

export default function CurriculumApprovalPage() {
  const [courses, setCourses] = React.useState<Course[]>([
    ...MOCK_COURSES,
    {
      id: 'crs-pending-01',
      title: 'Hóa Học 11: Chuyên Đề Cân Bằng Hóa Học & Phản Ứng Oxi Hóa Khử',
      slug: 'hoa-hoc-11-can-bang',
      description: 'Bộ giáo án chuẩn bị cho học kỳ I gồm 15 bài giảng video và 5 đề trắc nghiệm.',
      thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80',
      price: 350000,
      is_marketplace: true,
      status: 'PENDING',
      level: 'INTERMEDIATE',
      teacher_name: 'Cô Hoàng Mai Lan',
      teacher_id: 'tchr-04',
      department_name: 'Tổ Khoa Học Tự Nhiên',
      total_lessons: 15,
      total_duration_mins: 450,
      created_at: '2026-08-23T10:00:00Z',
      updated_at: '2026-08-23T10:00:00Z',
    },
  ]);

  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [actionType, setActionType] = React.useState<'APPROVE' | 'REJECT' | null>(null);

  const handleAction = () => {
    if (!selectedCourse || !actionType) return;
    setCourses((prev) =>
      prev.map((c) =>
        c.id === selectedCourse.id
          ? { ...c, status: actionType === 'APPROVE' ? 'PUBLISHED' : 'REJECTED' }
          : c
      )
    );
    setSelectedCourse(null);
    setActionType(null);
    setFeedback('');
  };

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="purple" className="mb-2">Phân Hệ Trưởng Bộ Môn (HOD)</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Thẩm Định & Phê Duyệt Giáo Án / Khóa Học
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kiểm duyệt chất lượng nội dung bài giảng, video và đề thi của giáo viên trước khi phát hành toàn trường hoặc mở bán.
        </p>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <Card key={course.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <img src={course.thumbnail_url || ''} alt={course.title} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="text-[10px]">{course.department_name}</Badge>
                  <Badge
                    variant={
                      course.status === 'PUBLISHED'
                        ? 'success'
                        : course.status === 'PENDING'
                        ? 'warning'
                        : 'danger'
                    }
                    className="text-[10px]"
                  >
                    {course.status}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{course.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biên soạn bởi: <span className="font-semibold text-slate-700 dark:text-slate-300">{course.teacher_name}</span> • {course.total_lessons} bài học
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {course.status === 'PENDING' ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCourse(course);
                      setActionType('REJECT');
                    }}
                    leftIcon={<X className="w-3.5 h-3.5 text-rose-500" />}
                  >
                    Yêu Cầu Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedCourse(course);
                      setActionType('APPROVE');
                    }}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Duyệt Phát Hành
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="ghost" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Xem Chi Tiết
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Approval / Feedback Modal */}
      <Dialog
        isOpen={!!selectedCourse}
        onClose={() => {
          setSelectedCourse(null);
          setActionType(null);
        }}
        title={actionType === 'APPROVE' ? 'Xác Nhận Duyệt Giáo Án' : 'Yêu Cầu Chỉnh Sửa Chuyên Môn'}
        description={`Khóa học: ${selectedCourse?.title}`}
      >
        <div className="space-y-4 py-2">
          <Textarea
            label="Lời nhận xét / Góp ý chuyên môn cho Giáo viên"
            placeholder={
              actionType === 'APPROVE'
                ? 'Nội dung bám sát khung chương trình, bài tập đa dạng. Đồng ý cho phép xuất bản...'
                : 'Cần bổ sung thêm ví dụ minh họa trong bài 2 và kiểm tra lại đáp án câu 4 phần trắc nghiệm...'
            }
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setSelectedCourse(null)}>
              Hủy
            </Button>
            <Button
              variant={actionType === 'APPROVE' ? 'primary' : 'destructive'}
              onClick={handleAction}
            >
              {actionType === 'APPROVE' ? 'Phê Duyệt Ngay' : 'Gửi Yêu Cầu Sửa'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
