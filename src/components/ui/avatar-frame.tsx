'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type AvatarFrameTier = 'DEFAULT' | 'FREE' | 'STUDENT_50K' | '50K' | 'STUDENT_100K' | '100K' | 'VIP';

export interface AvatarFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  tier?: AvatarFrameTier | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showBadge?: boolean;
  children: React.ReactNode;
}

// Chuẩn hóa tier về 3 loại chính
export function normalizeTier(tier?: string | null): 'DEFAULT' | 'STUDENT_50K' | 'STUDENT_100K' {
  if (!tier) return 'DEFAULT';
  const upper = String(tier).toUpperCase();
  if (upper.includes('100K') || upper.includes('VIP')) return 'STUDENT_100K';
  if (upper.includes('50K')) return 'STUDENT_50K';
  return 'DEFAULT';
}

/**
 * Hook để lấy và cập nhật khung avatar hiện tại của người dùng
 * Tự động đồng bộ qua localStorage và CustomEvent 'avatar-frame-updated'
 */
export function useActiveAvatarFrame(defaultTier?: string) {
  const [frameTier, setFrameTier] = React.useState<AvatarFrameTier>('DEFAULT');

  React.useEffect(() => {
    const readTier = () => {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('schoolify_avatar_frame');
      if (stored) {
        setFrameTier(normalizeTier(stored));
      } else if (defaultTier) {
        setFrameTier(normalizeTier(defaultTier));
      }
    };

    readTier();

    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ tier: AvatarFrameTier }>;
      if (customEvt.detail?.tier) {
        setFrameTier(normalizeTier(customEvt.detail.tier));
      } else {
        readTier();
      }
    };

    window.addEventListener('avatar-frame-updated', handleUpdate);
    window.addEventListener('storage', readTier);
    return () => {
      window.removeEventListener('avatar-frame-updated', handleUpdate);
      window.removeEventListener('storage', readTier);
    };
  }, [defaultTier]);

  const setTier = React.useCallback((tier: AvatarFrameTier) => {
    const normalized = normalizeTier(tier);
    setFrameTier(normalized);
    if (typeof window !== 'undefined') {
      localStorage.setItem('schoolify_avatar_frame', normalized);
      window.dispatchEvent(new CustomEvent('avatar-frame-updated', { detail: { tier: normalized } }));
    }
  }, []);

  return { frameTier, setTier };
}

/**
 * Biểu tượng Ngôi sao 4 cánh hình học tối giản (Geometric 4-point Star ✦)
 * Chuẩn luxury & high-tech hiện đại
 */
function FourPointStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0L14.4 9.6L24 12L14.4 14.4L12 24L9.6 14.4L0 12L9.6 9.6L12 0Z" />
    </svg>
  );
}

/**
 * Biểu tượng Tia năng lượng tối giản (Energy Spark)
 */
function EnergySpark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13 2L4 14h7v8l9-12h-7V2z" />
    </svg>
  );
}

/**
 * Component AvatarFrame:
 * Thiết kế tối giản, hiện đại, sang trọng theo 3 gói:
 * - 'DEFAULT' (Tiêu Chuẩn): Viền hairline mỏng nhẹ tinh tế, thanh lịch thuần khiết.
 * - 'STUDENT_50K' (Bứt Phá): Viền gradient Sunset / Cyber hiện đại, chuyển sắc mượt mà kèm micro-emblem năng lượng.
 * - 'STUDENT_100K' (Thủ Khoa VIP): Viền ánh kim Champagne & Royal Gold cao cấp, hào quang dịu mắt, micro-star ✦ hoàng kim.
 */
export function AvatarFrame({
  tier = 'DEFAULT',
  size = 'md',
  showBadge = true,
  children,
  className,
  ...props
}: AvatarFrameProps) {
  const normalizedTier = normalizeTier(tier);

  // Kích thước chuẩn tỉ lệ cho viền, đệm trong và micro-badge
  const sizeConfig = {
    xs: {
      wrapPadding: 'p-[1.5px]',
      gapPadding: 'p-[1px]',
      badgeSize: 'w-3 h-3 -top-0.5 -right-0.5',
      iconSize: 'w-1.5 h-1.5',
    },
    sm: {
      wrapPadding: 'p-[1.5px]',
      gapPadding: 'p-[1px]',
      badgeSize: 'w-3.5 h-3.5 -top-0.5 -right-0.5',
      iconSize: 'w-2 h-2',
    },
    md: {
      wrapPadding: 'p-[2px]',
      gapPadding: 'p-[1.5px]',
      badgeSize: 'w-4 h-4 -top-0.5 -right-0.5',
      iconSize: 'w-2.5 h-2.5',
    },
    lg: {
      wrapPadding: 'p-[2px]',
      gapPadding: 'p-[1.5px]',
      badgeSize: 'w-4.5 h-4.5 -top-0.5 -right-0.5',
      iconSize: 'w-2.5 h-2.5',
    },
    xl: {
      wrapPadding: 'p-[2.5px]',
      gapPadding: 'p-[1.5px]',
      badgeSize: 'w-5 h-5 -top-1 -right-1',
      iconSize: 'w-3 h-3',
    },
    '2xl': {
      wrapPadding: 'p-[3px]',
      gapPadding: 'p-[2px]',
      badgeSize: 'w-6 h-6 -top-1 -right-1',
      iconSize: 'w-3.5 h-3.5',
    },
  }[size];

  return (
    <div className={cn('relative inline-flex items-center justify-center shrink-0', className)} {...props}>
      {/* ── 1. GÓI 100K: THỦ KHOA VIP (Luxury Metallic Gold & Champagne Aura) ── */}
      {normalizedTier === 'STUDENT_100K' && (
        <>
          {/* Viền ngoài ánh kim hoàng gia cao cấp + hào quang vàng dịu mắt */}
          <div
            className={cn(
              'relative rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.28)] ring-1 ring-amber-400/40 dark:ring-amber-300/30',
              sizeConfig.wrapPadding
            )}
          >
            {/* Đệm trong tạo hairline sắc nét */}
            <div className={cn('rounded-full bg-white dark:bg-slate-950', sizeConfig.gapPadding)}>
              <div className="relative rounded-full overflow-hidden flex items-center justify-center">
                {children}
              </div>
            </div>
          </div>

          {/* Micro-badge hoàng kim góc trên: Ngôi sao 4 cánh ✦ hình học tối giản */}
          {showBadge && (
            <div
              className={cn(
                'absolute z-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-amber-950 ring-1.5 ring-white dark:ring-slate-900 shadow-sm select-none',
                sizeConfig.badgeSize
              )}
              title="Thủ Khoa VIP"
            >
              <FourPointStar className={sizeConfig.iconSize} />
            </div>
          )}
        </>
      )}

      {/* ── 2. GÓI 50K: BỨT PHÁ (Modern Cyber / Electric Sunset Gradient) ── */}
      {normalizedTier === 'STUDENT_50K' && (
        <>
          {/* Viền gradient hiện đại chuyển sắc mượt mà */}
          <div
            className={cn(
              'relative rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-500 shadow-[0_0_10px_rgba(244,63,94,0.2)] ring-1 ring-rose-400/30 dark:ring-rose-400/20',
              sizeConfig.wrapPadding
            )}
          >
            {/* Đệm trong tạo hairline sắc nét */}
            <div className={cn('rounded-full bg-white dark:bg-slate-950', sizeConfig.gapPadding)}>
              <div className="relative rounded-full overflow-hidden flex items-center justify-center">
                {children}
              </div>
            </div>
          </div>

          {/* Micro-badge năng lượng góc trên: Tia sáng hình học tối giản */}
          {showBadge && (
            <div
              className={cn(
                'absolute z-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 text-white ring-1.5 ring-white dark:ring-slate-900 shadow-xs select-none',
                sizeConfig.badgeSize
              )}
              title="Gói Bứt Phá"
            >
              <EnergySpark className={sizeConfig.iconSize} />
            </div>
          )}
        </>
      )}

      {/* ── 3. GÓI MẶC ĐỊNH: TIÊU CHUẨN (Minimalist Clean Hairline) ── */}
      {normalizedTier === 'DEFAULT' && (
        <div
          className={cn(
            'relative rounded-full bg-slate-200/90 dark:bg-slate-700/80 ring-1 ring-slate-200 dark:ring-slate-700',
            sizeConfig.wrapPadding
          )}
        >
          {/* Đệm trong tạo hairline sắc nét */}
          <div className={cn('rounded-full bg-white dark:bg-slate-950', sizeConfig.gapPadding)}>
            <div className="relative rounded-full overflow-hidden flex items-center justify-center">
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Component Trình Chọn Khung Avatar (Dành cho Trang Cá Nhân / Hub)
 * Thiết kế tối giản, hiện đại, cao cấp
 */
export function AvatarFrameSelector({
  currentTier,
  onSelectTier,
}: {
  currentTier: AvatarFrameTier;
  onSelectTier: (tier: AvatarFrameTier) => void;
}) {
  const normalized = normalizeTier(currentTier);

  const FRAMES_CONFIG = [
    {
      id: 'DEFAULT' as AvatarFrameTier,
      name: 'Tiêu Chuẩn',
      badge: 'Miễn phí',
      desc: 'Viền hairline tối giản, thanh lịch và sạch sẽ.',
      tagColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
      price: '0đ',
    },
    {
      id: 'STUDENT_50K' as AvatarFrameTier,
      name: 'Bứt Phá',
      badge: 'Gói 50K',
      desc: 'Viền gradient hiện đại, chuyển sắc năng động.',
      tagColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/60',
      price: '50.000đ',
    },
    {
      id: 'STUDENT_100K' as AvatarFrameTier,
      name: 'Thủ Khoa VIP',
      badge: 'Gói 100K VIP',
      desc: 'Viền hoàng kim ánh kim và hào quang quý phái.',
      tagColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 font-semibold',
      price: '100.000đ',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {FRAMES_CONFIG.map((frame) => {
        const isSelected = normalized === frame.id;
        return (
          <button
            key={frame.id}
            type="button"
            onClick={() => onSelectTier(frame.id)}
            className={cn(
              'flex flex-col items-center text-center p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative group text-left',
              isSelected
                ? 'border-[#00B8DD] bg-[#E6F8FC]/30 dark:bg-cyan-950/20 ring-1 ring-[#00B8DD]/40 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            )}
          >
            {/* Active check pill */}
            {isSelected && (
              <span className="absolute top-2.5 right-2.5 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#00B8DD] text-white">
                Đang chọn
              </span>
            )}

            {/* Avatar Preview */}
            <div className="my-2 flex items-center justify-center">
              <AvatarFrame tier={frame.id} size="lg">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs">
                  HS
                </div>
              </AvatarFrame>
            </div>

            {/* Info */}
            <div className="mt-1 text-center w-full">
              <div className="flex items-center justify-center gap-1.5">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {frame.name}
                </h4>
              </div>
              <div className="mt-1 flex justify-center">
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', frame.tagColor)}>
                  {frame.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                {frame.desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
