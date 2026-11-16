'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Video, MapPin, Calendar, Clock, BookOpen, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Class, ClassSession } from '@/types';
import { sessionFormSchema, SessionFormValues } from './class.schema';

const pad = (n: number) => String(n).padStart(2, '0');

const toDateInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toTimeInput = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const todayInput = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

function buildDefaults(
  session: ClassSession | undefined,
  classes: Class[],
  initialDate?: string
): SessionFormValues {
  return {
    class_id: session?.class_id || classes[0]?.id || '',
    title: session?.title || '',
    date: toDateInput(session?.start_time) || initialDate || todayInput(),
    start_time: toTimeInput(session?.start_time) || '08:00',
    end_time: toTimeInput(session?.end_time) || '09:30',
    room: session?.room || '',
    meeting_url: session?.meeting_url || '',
  };
}

export function SessionFormDialog({
  isOpen,
  onClose,
  classes,
  session,
  teacherId,
  teacherName,
  initialDate,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  session?: ClassSession;
  teacherId: string;
  teacherName?: string;
  initialDate?: string;
  onSave: (payload: Omit<ClassSession, 'id'>) => void;
}) {
  const [mode, setMode] = React.useState<'ONLINE' | 'OFFLINE'>('ONLINE');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: buildDefaults(session, classes, initialDate),
  });

  const meetingUrlValue = watch('meeting_url');
  const roomValue = watch('room');

  React.useEffect(() => {
    if (isOpen) {
      const defs = buildDefaults(session, classes, initialDate);
      reset(defs);
      if (defs.meeting_url) {
        setMode('ONLINE');
      } else if (defs.room) {
        setMode('OFFLINE');
      } else {
        setMode('ONLINE');
      }
    }
  }, [isOpen, session, classes, initialDate, reset]);

  const submit = (values: SessionFormValues) => {
    const cls = classes.find((c) => c.id === values.class_id);
    onSave({
      class_id: values.class_id,
      teacher_id: teacherId,
      title: values.title,
      room: mode === 'OFFLINE' ? values.room || undefined : undefined,
      meeting_url: mode === 'ONLINE' ? values.meeting_url || undefined : undefined,
      start_time: new Date(`${values.date}T${values.start_time}:00`).toISOString(),
      end_time: new Date(`${values.date}T${values.end_time}:00`).toISOString(),
      class_name: cls?.class_name,
      teacher_name: teacherName,
    });
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={session ? 'Chỉnh Sửa Buổi Học' : 'Thêm Buổi Học Mới'}
      description="Lên lịch thời khóa biểu, phòng học trực tiếp hoặc link phòng học trực tuyến (Meet/Zoom)."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4 py-2">
        {/* Chọn Lớp Học */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Lớp học áp dụng *
          </label>
          <select
            {...register('class_id')}
            className="flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 cursor-pointer shadow-xs"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name} ({c.code || 'Chưa mã'})
              </option>
            ))}
          </select>
          {errors.class_id && (
            <p className="text-[11px] font-medium text-rose-500">{errors.class_id.message}</p>
          )}
        </div>

        {/* Tiêu đề buổi học */}
        <Input
          label="Tiêu đề bài học / tiết dạy *"
          placeholder="VD: Toán 12: Chuyên đề Đạo hàm & Tiệm cận"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Ngày & Giờ học */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Ngày dạy *" type="date" error={errors.date?.message} {...register('date')} />
          <Input
            label="Giờ bắt đầu *"
            type="time"
            error={errors.start_time?.message}
            {...register('start_time')}
          />
          <Input
            label="Giờ kết thúc *"
            type="time"
            error={errors.end_time?.message}
            {...register('end_time')}
          />
        </div>

        {/* Hình Thức Giảng Dạy Toggle */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
            Hình thức giảng dạy *
          </label>

          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setMode('ONLINE')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer',
                mode === 'ONLINE'
                  ? 'bg-white text-[#007D99] dark:bg-slate-900 dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              <Video className="w-4 h-4 text-[#00B8DD]" />
              Học Trực Tuyến (Meet / Zoom)
            </button>
            <button
              type="button"
              onClick={() => setMode('OFFLINE')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer',
                mode === 'OFFLINE'
                  ? 'bg-white text-amber-700 dark:bg-slate-900 dark:text-amber-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              )}
            >
              <MapPin className="w-4 h-4 text-amber-500" />
              Tại Phòng Học Trực Tiếp
            </button>
          </div>

          {mode === 'ONLINE' ? (
            <div className="space-y-2 pt-1 animate-fadeIn">
              <Input
                label="Đường dẫn phòng học trực tuyến (meeting_url)"
                placeholder="https://meet.google.com/abc-defg-hij hoặc https://zoom.us/j/..."
                error={errors.meeting_url?.message}
                helperText="Dán đường link Google Meet, Zoom Meeting hoặc MS Teams để học sinh bấm vào học trực tiếp."
                {...register('meeting_url')}
              />
            </div>
          ) : (
            <div className="space-y-2 pt-1 animate-fadeIn">
              <Input
                label="Tên phòng học tại trường (room)"
                placeholder="VD: Phòng A302 (Tầng 3, Nhà A)"
                error={errors.room?.message}
                helperText="Điền tên phòng học vật lý tại trung tâm/trường học."
                {...register('room')}
              />
            </div>
          )}
        </div>

        {/* Nút Submit */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full justify-center bg-[#00B8DD] hover:bg-[#009BBD] text-white font-bold h-11 rounded-2xl shadow-md shadow-[#00B8DD]/25"
            leftIcon={<Save className="w-4 h-4" />}
          >
            {session ? 'Lưu Thay Đổi Buổi Học' : 'Tạo Buổi Học Mới'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

