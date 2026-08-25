'use client';

import * as React from 'react';
import { Calendar, Plus, Users, Video, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_TIMETABLE } from '@/services/mock/data';

export default function TeacherClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="purple" className="mb-2">Lịch Dạy & Phòng Học</Badge>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Lớp Học & Ca Giảng Dạy Của Tôi
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các buổi học, cập nhật link Google Meet/Zoom và chỉ định giáo viên dạy thay khi bận.
          </p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />}>Thêm Buổi Học Mới</Button>
      </div>

      <div className="space-y-4">
        {MOCK_TIMETABLE.map((session) => (
          <Card key={session.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs">08:00 - 09:45</Badge>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{session.class_name}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{session.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {session.room || 'Phòng Học Online'}
                </span>
                {session.meeting_url && (
                  <span className="text-indigo-600 font-mono text-[11px] truncate max-w-xs">
                    {session.meeting_url}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">Đổi Giáo Viên Dạy Thay</Button>
              <Button size="sm" variant="primary">Bắt Đầu Buổi Học</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
