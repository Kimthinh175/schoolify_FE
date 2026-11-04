import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Tên chuẩn của 2 loại điểm trên Schoolify.
 * - Tia Sáng: cấp mỗi ngày (reset 00:00), dùng để tạo & làm đề.
 * - Ngọc Tri Thức: tích lũy vĩnh viễn, dùng hỏi Gia sư AI & đổi quà.
 */
export const POINT_NAMES = {
  spark: 'Tia Sáng',
  gem: 'Ngọc Tri Thức',
  gemShort: 'Ngọc',
} as const;

interface PointIconProps {
  className?: string;
  /** Tắt glow (dùng trong khối chữ nhỏ / nền sáng chói) */
  flat?: boolean;
  title?: string;
}

/**
 * Icon "Tia Sáng" – ngôi sao 4 cánh màu Amber, kèm tia lấp lánh phụ.
 * Ý nghĩa: năng lượng học tập được thắp mỗi ngày.
 */
export function TiaSangIcon({ className, flat, title }: PointIconProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = `tsg${uid}`;
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('w-4 h-4 shrink-0', !flat && 'drop-shadow-[0_0_3px_rgba(245,158,11,0.55)]', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={g} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="45%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Ngôi sao 4 cánh chính */}
      <path
        d="M10.5 2.5 C11.3 8 13 9.7 18.5 10.5 C13 11.3 11.3 13 10.5 18.5 C9.7 13 8 11.3 2.5 10.5 C8 9.7 9.7 8 10.5 2.5 Z"
        fill={`url(#${g})`}
        stroke="#B45309"
        strokeOpacity="0.35"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* Lõi sáng */}
      <circle cx="10.5" cy="10.5" r="1.6" fill="#FFFBEB" />
      {/* Tia lấp lánh phụ */}
      <path
        d="M18.5 14.5 C18.8 16.6 19.4 17.2 21.5 17.5 C19.4 17.8 18.8 18.4 18.5 20.5 C18.2 18.4 17.6 17.8 15.5 17.5 C17.6 17.2 18.2 16.6 18.5 14.5 Z"
        fill="#F59E0B"
      />
      <circle cx="19" cy="4.5" r="1.1" fill="#FCD34D" />
    </svg>
  );
}

/**
 * Icon "Ngọc Tri Thức" – viên ngọc cắt giác màu Cyan thương hiệu,
 * có điểm sáng tri thức ở mặt trên.
 */
export function NgocIcon({ className, flat, title }: PointIconProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = `ngg${uid}`;
  const t = `ngt${uid}`;
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('w-4 h-4 shrink-0', !flat && 'drop-shadow-[0_0_3px_rgba(0,184,221,0.55)]', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={g} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#CFFAFE" />
          <stop offset="45%" stopColor="#00B8DD" />
          <stop offset="100%" stopColor="#0E5A73" />
        </linearGradient>
        <linearGradient id={t} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ECFEFF" />
          <stop offset="100%" stopColor="#5CE1FF" />
        </linearGradient>
      </defs>
      {/* Thân ngọc */}
      <path
        d="M7 3.5 H17 L21 9 L12 21 L3 9 Z"
        fill={`url(#${g})`}
        stroke="#0B4F63"
        strokeOpacity="0.45"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Mặt vương miện */}
      <path d="M7 3.5 H17 L21 9 H3 Z" fill={`url(#${t})`} fillOpacity="0.75" />
      {/* Đường giác cắt */}
      <path
        d="M3 9 H21 M7 3.5 L9.5 9 L12 3.5 L14.5 9 L17 3.5 M9.5 9 L12 21 L14.5 9"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.55"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      {/* Điểm sáng tri thức */}
      <path
        d="M8.2 11.5 C8.4 12.8 8.8 13.2 10.1 13.4 C8.8 13.6 8.4 14 8.2 15.3 C8 14 7.6 13.6 6.3 13.4 C7.6 13.2 8 12.8 8.2 11.5 Z"
        fill="#ffffff"
        fillOpacity="0.9"
      />
    </svg>
  );
}
