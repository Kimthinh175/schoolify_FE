'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Edit,
  Eye,
  Trash2,
  CheckCircle2,
  Video,
  FileText,
  DollarSign,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { MOCK_COURSES } from '@/services/mock/data';
import { Course } from '@/types';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = React.useState<Course[]>(MOCK_COURSES);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newPrice, setNewPrice] = React.useState('499000');
  const [newDesc, setNewDesc] = React.useState('');

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/\s+/g, '-'),
      description: newDesc,
      price: parseInt(newPrice) || 0,
      is_marketplace: true,
      status: 'PUBLISHED',
      teacher_id: 'tchr-01',
      teacher_name: 'ThS. Nguyễn Văn Hùng',
      department_name: 'Tổ Toán & Tin Học',
      total_lessons: 1,
      total_duration_mins: 30,
      thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCourses([newCourse, ...courses]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Course Builder & Marketplace</Badge>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Quản Lý & Soạn Thảo Khóa Học
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo giáo án, bài giảng video, bài tập trắc nghiệm và cấu hình mở bán khóa học lên sàn thương mại.
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Tạo Khóa Học Mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="p-0 overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all">
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img src={course.thumbnail_url || ''} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute top-3 right-3">
                <Badge variant="primary" className="font-bold">
                  {formatMoney(course.price)}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3">
                <Badge variant={course.status === 'PUBLISHED' ? 'success' : 'warning'}>
                  {course.status}
                </Badge>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{course.department_name}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">{course.total_lessons} bài học</span>
                <div className="flex items-center gap-1.5">
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 px-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs">
                    Chỉnh Sửa
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Course Builder Modal */}
      <Dialog
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Khóa Học Mới (Course Builder)"
        description="Điền thông tin và cấu hình mở bán khóa học."
      >
        <form onSubmit={handleCreateCourse} className="space-y-4 py-2">
          <Input
            label="Tên khóa học *"
            placeholder="VD: Vật Lý 11: Luyện Giải Đề Nâng Cao"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <Input
            label="Giá bán khóa học (VNĐ)"
            type="number"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            helperText="Nhập 0 nếu bạn muốn phát hành miễn phí cho học sinh trong trường."
          />
          <Textarea
            label="Mô tả tóm tắt khóa học"
            placeholder="Nêu mục tiêu bài học, kiến thức đạt được..."
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Tạo & Tiếp Tục Thêm Bài Giảng
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
