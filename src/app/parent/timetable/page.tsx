'use client';

import { Calendar, User, MapPin, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useParentStore } from '@/store/parent.store';
import { MOCK_TIMETABLE } from '@/services/mock/data';

export default function ParentTimetablePage() {
  const { children, activeChildId } = useParentStore();
  const activeChild = children.find((c) => c.id === activeChildId) || children[0];

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="purple" className="mb-2">Theo Dõi Lịch Học</Badge>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Thời Khóa Biểu Của Con: {activeChild.name}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Giúp phụ huynh nắm bắt lịch học trực tiếp và trực tuyến để thuận tiện đưa đón và nhắc nhở con.
        </p>
      </div>

      <div className="space-y-4">
        {MOCK_TIMETABLE.map((session) => (
          <Card key={session.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="primary" className="text-xs">08:00 - 09:45</Badge>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{activeChild.className}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{session.title}</h3>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Giáo viên: {session.teacher_name}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  Địa điểm: {session.room || 'Phòng Học Trực Tuyến'}
                </span>
              </div>
            </div>

            <div>
              <Badge variant={session.room ? 'secondary' : 'default'}>
                {session.room ? 'Học Tại Trường' : 'Học Trực Tuyến'}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
