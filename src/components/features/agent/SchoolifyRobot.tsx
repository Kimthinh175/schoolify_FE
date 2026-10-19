'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SchoolifyRobotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isFloating?: boolean;
  statusBadge?: boolean;
  showLabel?: boolean;
  labelText?: string;
}

/**
 * SchoolifyRobot - Trợ lý AI dạng "lõi AI lơ lửng".
 * Vỏ kính tối + viền sáng mảnh (không nhựa trắng bóng), mắt LED mềm có glow và
 * dõi theo con trỏ chuột, mũ cử nhân hologram lơ lửng phía trên, vòng sáng nâng đỡ bên dưới.
 */
export function SchoolifyRobot({
  size = 'lg',
  className,
  isFloating = true,
  statusBadge = false,
  showLabel = false,
  labelText = 'Hỏi gia sư AI',
}: SchoolifyRobotProps) {
  // id duy nhất cho gradient/filter (tránh trùng khi có nhiều robot trên trang)
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (name: string) => `sf${name}${uid}`;
  const ref = (name: string) => `url(#${id(name)})`;

  const isFull = size === 'lg' || size === 'xl';
  const svgRef = React.useRef<SVGSVGElement>(null);
  const eyesRef = React.useRef<SVGGElement>(null);

  // Mắt dõi theo con trỏ chuột
  React.useEffect(() => {
    if (!isFull) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const svg = svgRef.current;
        const eyes = eyesRef.current;
        if (!svg || !eyes) return;
        const r = svg.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.55;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, dist / 280);
        eyes.style.transform = `translate(${(dx / dist) * k * 5}px, ${(dy / dist) * k * 3.5}px)`;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [isFull]);

  // ── Avatar thu nhỏ cho Header Chatbox và tin nhắn ──
  if (!isFull) {
    const isSmall = size === 'sm';
    return (
      <div
        className={cn(
          'relative flex items-center justify-center shrink-0 select-none',
          isSmall ? 'w-7 h-7' : 'w-10 h-10',
          className
        )}
      >
        <svg viewBox="0 0 64 64" className="w-full h-full overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id={id('MHead')} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3B4A63" />
              <stop offset="100%" stopColor="#0B1220" />
            </linearGradient>
            <linearGradient id={id('MRim')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00B8DD" stopOpacity="0.35" />
            </linearGradient>
            <linearGradient id={id('MEye')} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#D6F7FF" />
              <stop offset="100%" stopColor="#00B8DD" />
            </linearGradient>
          </defs>

          <rect
            x="7"
            y="20"
            width="50"
            height="38"
            rx="17"
            fill={ref('MHead')}
            stroke={ref('MRim')}
            strokeWidth="1.4"
          />
          <rect x="12" y="25" width="40" height="28" rx="13" fill="#050A14" />
          <rect x="22" y="32" width="6" height="11" rx="3" fill={ref('MEye')} />
          <rect x="36" y="32" width="6" height="11" rx="3" fill={ref('MEye')} />

          {/* Mũ hologram */}
          <polygon
            points="32,3 52,10 32,17 12,10"
            fill="rgba(0,184,221,0.22)"
            stroke="#00B8DD"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M32 10 L47 12.5 L47 18"
            stroke="#F59E0B"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="47" cy="19" r="1.6" fill="#F59E0B" />
        </svg>

        {statusBadge && (
          <span
            className={cn(
              'absolute z-20 flex',
              isSmall ? 'w-2 h-2 -bottom-0.5 -right-0.5' : 'w-2.5 h-2.5 bottom-0 right-0'
            )}
          >
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
          </span>
        )}
      </div>
    );
  }

  // ── Linh vật đầy đủ (nút mở chatbox) ──
  return (
    <div className={cn('relative flex flex-col items-center select-none', className)}>
      <style>{`
        @keyframes sfFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes sfCapBob {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-3px) rotate(1.5deg); }
        }
        @keyframes sfBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes sfAura {
          0%, 100% { opacity: 0.75; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.06); }
        }
        @keyframes sfTwinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes sfFlow {
          to { stroke-dashoffset: -24; }
        }
        @keyframes sfPing {
          0% { transform: scale(1); opacity: 0.7; }
          80%, 100% { transform: scale(2.4); opacity: 0; }
        }
        .sf-float { animation: sfFloat 3.6s ease-in-out infinite; }
        .sf-cap { transform-box: fill-box; transform-origin: center bottom; animation: sfCapBob 4.2s ease-in-out infinite; }
        .sf-eye { transform-box: fill-box; transform-origin: center; animation: sfBlink 5s infinite; }
        .sf-look { transition: transform 0.18s ease-out; }
        .sf-aura { transform-box: fill-box; transform-origin: center; animation: sfAura 4s ease-in-out infinite; }
        .sf-spark { transform-box: fill-box; transform-origin: center; animation: sfTwinkle 3s ease-in-out infinite; }
        .sf-flow { animation: sfFlow 2.4s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sf-float, .sf-cap, .sf-eye, .sf-aura, .sf-spark, .sf-flow { animation: none; }
        }
      `}</style>

      <svg
        ref={svgRef}
        className="w-[116px] h-[135px] sm:w-[128px] sm:h-[149px] overflow-visible"
        viewBox="0 0 120 140"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={id('Aura')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00B8DD" stopOpacity="0.38" />
            <stop offset="55%" stopColor="#6366F1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#00B8DD" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={id('Pool')} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00B8DD" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#00B8DD" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={id('Head')} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#3B4A63" />
            <stop offset="45%" stopColor="#1B2538" />
            <stop offset="100%" stopColor="#0A101D" />
          </linearGradient>
          <linearGradient id={id('Rim')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00B8DD" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id={id('Visor')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B1526" />
            <stop offset="100%" stopColor="#02060D" />
          </linearGradient>
          <linearGradient id={id('Eye')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E3FAFF" />
            <stop offset="100%" stopColor="#00B8DD" />
          </linearGradient>
          <linearGradient id={id('RingBack')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00B8DD" stopOpacity="0" />
            <stop offset="50%" stopColor="#00B8DD" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00B8DD" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('RingFront')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00B8DD" stopOpacity="0" />
            <stop offset="50%" stopColor="#5CE1FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#00B8DD" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={id('Cap')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00B8DD" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#00B8DD" stopOpacity="0.1" />
          </linearGradient>
          <filter id={id('Glow')} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="2.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={id('Soft')} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hào quang nền */}
        <circle
          className={cn('sf-aura transition-opacity opacity-80 group-hover:opacity-100')}
          cx="60"
          cy="76"
          r="62"
          fill={ref('Aura')}
        />

        {/* Vệt sáng trên mặt phẳng bên dưới */}
        <ellipse cx="60" cy="128" rx="34" ry="5" fill={ref('Pool')} />

        {/* Tia lấp lánh */}
        {[
          { x: 12, y: 44, s: 1, d: '0s' },
          { x: 108, y: 58, s: 0.8, d: '1s' },
          { x: 102, y: 14, s: 0.7, d: '2s' },
        ].map((sp) => (
          <path
            key={sp.d}
            className="sf-spark"
            style={{ animationDelay: sp.d }}
            d="M0 -4.5 L1.1 -1.1 L4.5 0 L1.1 1.1 L0 4.5 L-1.1 1.1 L-4.5 0 L-1.1 -1.1Z"
            transform={`translate(${sp.x} ${sp.y}) scale(${sp.s})`}
            fill="#8BEBFF"
          />
        ))}

        <g className={cn(isFloating && 'sf-float')}>
          {/* Vòng sáng nâng đỡ - nửa sau */}
          <path
            d="M8 102 A52 11 0 0 1 112 102"
            fill="none"
            stroke={ref('RingBack')}
            strokeWidth="1.4"
          />

          {/* Đầu: kính tối + viền sáng mảnh */}
          <rect
            x="22"
            y="44"
            width="76"
            height="62"
            rx="28"
            fill={ref('Head')}
            stroke={ref('Rim')}
            strokeWidth="1.6"
          />
          {/* Ánh sáng nhẹ ở mép trên */}
          <path
            d="M34 52 Q60 41 86 52"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.14"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Mặt kính */}
          <rect
            x="29"
            y="52"
            width="62"
            height="44"
            rx="22"
            fill={ref('Visor')}
            stroke="#00B8DD"
            strokeOpacity="0.28"
            strokeWidth="0.9"
          />
          <path
            d="M36 60 Q60 51 84 60 L84 66 Q60 58 36 66 Z"
            fill="#fff"
            fillOpacity="0.05"
          />

          {/* Mắt LED dõi theo chuột */}
          <g ref={eyesRef} className="sf-look">
            <g filter={ref('Glow')}>
              <rect className="sf-eye" x="43" y="64" width="10" height="17" rx="5" fill={ref('Eye')} />
              <rect className="sf-eye" x="67" y="64" width="10" height="17" rx="5" fill={ref('Eye')} />
            </g>
            <path
              d="M54 88 Q60 91.5 66 88"
              fill="none"
              stroke="#00B8DD"
              strokeOpacity="0.75"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>

          {/* Vòng sáng nâng đỡ - nửa trước */}
          <path
            d="M8 102 A52 11 0 0 0 112 102"
            fill="none"
            stroke={ref('RingFront')}
            strokeWidth="1.8"
            filter={ref('Soft')}
          />
          <path
            className="sf-flow"
            d="M16 103 A44 8 0 0 0 104 103"
            fill="none"
            stroke="#8BEBFF"
            strokeOpacity="0.55"
            strokeWidth="1"
            strokeDasharray="3 5"
          />

          {/* Mũ cử nhân hologram lơ lửng */}
          <g className="sf-cap">
            <g filter={ref('Soft')}>
              <path
                d="M44 25 L44 33 Q60 39 76 33 L76 25"
                fill="rgba(0,184,221,0.14)"
                stroke="#00B8DD"
                strokeOpacity="0.7"
                strokeWidth="1"
              />
              <polygon
                points="60,7 98,20 60,33 22,20"
                fill={ref('Cap')}
                stroke="#5CE1FF"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <circle cx="60" cy="20" r="2" fill="#CFF6FF" />
              <path
                d="M60 20 L90 24 L90 36"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="90" cy="38" r="2.6" fill="#FBBF24" />
            </g>
          </g>
        </g>
      </svg>

      {showLabel && (
        <div className="mt-1 px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-[#0F1B2D] text-white font-semibold text-xs tracking-wide shadow-lg shadow-slate-900/20 ring-1 ring-white/10 dark:ring-[#00B8DD]/30 flex items-center gap-2">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-[#00B8DD] animate-[sfPing_2s_ease-out_infinite]" />
            <span className="relative w-2 h-2 rounded-full bg-[#00B8DD]" />
          </span>
          <span>{labelText}</span>
        </div>
      )}
    </div>
  );
}
