'use client';

import Link from 'next/link';
import { BookOpen, Play, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MOCK_COURSES } from '@/services/mock/data';

export default function MyCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="purple" className="mb-2">Khóa Học Đã Đăng Ký</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Khóa Học Của Tôi
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tiếp tục các bài giảng còn dang dở và theo dõi % hoàn thành khóa học.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COURSES.slice(0, 2).map((course, idx) => (
          <Card key={course.id} className="p-0 overflow-hidden flex flex-col justify-between group hover:shadow-xl transition-all">
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img src={course.thumbnail_url || ''} alt={course.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute top-3 right-3">
                <Badge variant="secondary" className="bg-white/90 dark:bg-slate-900/90 font-bold">
                  {idx === 0 ? '65% Hoàn thành' : '30% Hoàn thành'}
                </Badge>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{course.department_name}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Giảng viên: {course.teacher_name}</p>
              </div>

              <div>
                <Progress value={idx === 0 ? 65 : 30} showLabel className="mb-3" />
                <Link href="/student/learn/crs-01/ls-01">
                  <Button className="w-full justify-center" leftIcon={<Play className="w-4 h-4" />}>
                    Vào Học Tiếp
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
