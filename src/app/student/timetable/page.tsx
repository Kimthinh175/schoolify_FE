'use client';

import { Calendar, Clock, MapPin, Video, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MOCK_TIMETABLE } from '@/services/mock/data';

export default function StudentTimetablePage() {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="purple" className="mb-2">Lịch Trình Học Tập</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Thời Khóa Biểu Tuần (Lớp 11A1)
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Theo dõi các ca học trực tiếp tại trường và các buổi học trực tuyến qua Google Meet/Zoom.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_TIMETABLE.map((session) => (
          <Card key={session.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs">
                  08:00 - 09:45
                </Badge>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {session.class_name}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{session.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {session.teacher_name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {session.room || 'Phòng Học Trực Tuyến'}
                </span>
              </div>
            </div>

            <div>
              {session.meeting_url ? (
                <a href={session.meeting_url} target="_blank" rel="noreferrer">
                  <Button variant="primary" leftIcon={<Video className="w-4 h-4" />}>
                    Vào Học Online
                  </Button>
                </a>
              ) : (
                <Button variant="outline" disabled>Học Trực Tiếp Tại Trường</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
