'use client';

import { Clock, MapPin, Video, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ClassSession } from '@/types';

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const getPlatform = (url?: string) => {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.includes('meet.google') || lower.includes('google.com/meet')) return 'Google Meet';
  if (lower.includes('zoom.us') || lower.includes('zoom.com')) return 'Zoom Meeting';
  if (lower.includes('teams.microsoft') || lower.includes('teams.live')) return 'MS Teams';
  return 'Phòng Trực Tuyến';
};

export function SessionCard({
  session,
  onEdit,
  onDelete,
}: {
  session: ClassSession;
  onEdit: (session: ClassSession) => void;
  onDelete: (session: ClassSession) => void;
}) {
  const isOnline = Boolean(session.meeting_url);
  const platform = getPlatform(session.meeting_url);

  const now = new Date().getTime();
  const start = new Date(session.start_time).getTime();
  const end = new Date(session.end_time).getTime();
  const isLive = now >= start && now <= end;
  const isPast = now > end;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-xl border p-2.5 sm:p-3 transition-all duration-150 hover:shadow-md',
        isLive
          ? 'border-[#00B8DD] bg-[#E6F8FC]/60 ring-2 ring-[#00B8DD]/40 dark:bg-[#00B8DD]/10 dark:border-[#00B8DD]'
          : isOnline
            ? 'border-indigo-100 bg-gradient-to-b from-indigo-50/30 to-white hover:border-indigo-300 dark:border-indigo-900/40 dark:from-indigo-950/20 dark:to-slate-900'
            : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
      )}
    >
      <div className="space-y-1.5">
        {/* Hàng 1: Thời gian + Nút Sửa / Xóa */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-black tracking-tight shrink-0',
                isLive
                  ? 'bg-[#00B8DD] text-white'
                  : isPast
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
              )}
            >
              <Clock className="w-3 h-3 shrink-0" />
              {fmtTime(session.start_time)} - {fmtTime(session.end_time)}
            </span>

            {isLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-1.5 py-0.2 text-[9px] font-black text-white uppercase tracking-wider shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                Đang học
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(session)}
              className="rounded-lg p-1.5 text-amber-600 bg-amber-50/80 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-950/80 transition-colors cursor-pointer"
              title="Chỉnh sửa buổi học"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(session)}
              className="rounded-lg p-1.5 text-rose-600 bg-rose-50/80 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/80 transition-colors cursor-pointer"
              title="Xoá buổi học"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tiêu đề & Tên Lớp */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight">
            {session.title}
          </h4>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {session.class_name || 'Chưa mã lớp'}
          </p>
        </div>

        {/* Badge Nền Tảng (Google Meet / Zoom) */}
        {isOnline && (
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
              <Video className="w-3 h-3 shrink-0" />
              {platform}
            </span>
          </div>
        )}
      </div>

      {/* Hàng Nút Hành Động (Vào phòng / Địa điểm) */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {session.meeting_url ? (
          <a
            href={session.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group/btn"
            title={`Mở ${platform}`}
          >
            <Button
              size="sm"
              variant={isLive ? 'primary' : 'outline'}
              className={cn(
                'w-full justify-center h-7 px-2 text-[11px] font-bold transition-all',
                isLive
                  ? 'bg-[#00B8DD] hover:bg-[#009BBD] text-white shadow-xs'
                  : 'border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/60'
              )}
              leftIcon={<Video className="w-3 h-3 shrink-0" />}
              rightIcon={<ExternalLink className="w-3 h-3 opacity-60 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />}
            >
              Vào Phòng Học
            </Button>
          </a>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg truncate">
            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
            <span className="truncate">{session.room || 'Phòng học trực tiếp'}</span>
          </div>
        )}
      </div>
    </div>
  );
}


