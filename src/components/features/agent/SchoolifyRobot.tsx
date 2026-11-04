'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type RobotEmotion =
  | 'default'
  | 'happy'
  | 'excited'
  | 'wink'
  | 'thinking'
  | 'idea'
  | 'love'
  | 'celebrate'
  | 'sad'
  | 'angry'
  | 'sleeping'
  | 'surprised'
  | 'stunned';

const DISTORT_CSS = `
  @keyframes sfDEyeL { 0%,20% { transform: translateX(0) rotate(0deg) scale(1,1); } 40%,82% { transform: translateX(-2.5px) rotate(5deg) scale(1.4,1.6); } 100% { transform: translateX(0) rotate(0deg) scale(1,1); } }
  @keyframes sfDEyeR { 0%,20% { transform: translateX(0) rotate(0deg) scale(1,1); } 40%,82% { transform: translateX(2.5px) rotate(-5deg) scale(1.4,1.6); } 100% { transform: translateX(0) rotate(0deg) scale(1,1); } }
  @keyframes sfDPupilL { 0%,20% { transform: translate(0,0); } 40%,82% { transform: translate(-3px,-2px); } 100% { transform: translate(0,0); } }
  @keyframes sfDPupilR { 0%,20% { transform: translate(0,0); } 40%,82% { transform: translate(3px,-2px); } 100% { transform: translate(0,0); } }
  @keyframes sfDBrow { 0%,20% { transform: translateY(0); } 40%,82% { transform: translateY(-2px); } 100% { transform: translateY(0); } }
  @keyframes sfDMouth { 0%,20% { transform: translateY(0) scaleX(1); } 40%,82% { transform: translateY(2px) scaleX(1.2); } 100% { transform: translateY(0) scaleX(1); } }
  .sf-d-eye-l, .sf-d-eye-r, .sf-d-brow, .sf-d-mouth, .sf-d-pupil-l, .sf-d-pupil-r { transform-box: fill-box; transform-origin: center; }
  .sf-d-eye-l { animation: sfDEyeL 2.6s ease-in-out infinite; }
  .sf-d-eye-r { animation: sfDEyeR 2.6s ease-in-out infinite; }
  .sf-d-pupil-l { animation: sfDPupilL 2.6s ease-in-out infinite; }
  .sf-d-pupil-r { animation: sfDPupilR 2.6s ease-in-out infinite; }
  .sf-d-brow { animation: sfDBrow 2.6s ease-in-out infinite; }
  .sf-d-mouth { animation: sfDMouth 2.6s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) { .sf-d-eye-l, .sf-d-eye-r, .sf-d-brow, .sf-d-mouth, .sf-d-pupil-l, .sf-d-pupil-r { animation: none; } }
`;

export interface SchoolifyRobotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  emotion?: RobotEmotion;
  isFloating?: boolean;
  statusBadge?: boolean;
  showLabel?: boolean;
  labelText?: string;
}

/**
 * SchoolifyRobot - Trợ lý AI dạng "lõi AI lơ lửng" với 12 biểu cảm cảm xúc phong phú.
 * Thiết kế chuẩn Vector SVG hologram: Vỏ kính tối + viền sáng mảnh (không nhựa trắng bóng),
 * mắt LED mềm có glow, mũ cử nhân hologram lơ lửng phía trên, vòng sáng nâng đỡ bên dưới.
 */
export function SchoolifyRobot({
  size = 'lg',
  className,
  emotion = 'default',
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

  // Chỉ bật eye-tracking theo chuột với các cảm xúc phù hợp (tránh méo hình dạng mắt đặc biệt như tim, nháy mắt, v.v.)
  const canTrackMouse = isFull && (emotion === 'default' || emotion === 'thinking' || emotion === 'surprised');

  // Mắt dõi theo con trỏ chuột
  React.useEffect(() => {
    if (!canTrackMouse) {
      if (eyesRef.current) {
        eyesRef.current.style.transform = 'translate(0px, 0px)';
      }
      return;
    }
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
  }, [canTrackMouse]);

  // ── Render Biểu Cảm Mắt & Miệng cho Size Mini (sm / md) ──
  const renderMiniFace = () => {
    switch (emotion) {
      case 'happy':
      case 'idea':
      case 'celebrate':
        return (
          <>
            <path d="M21 38 Q25 31 29 38" fill="none" stroke="#D6F7FF" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M35 38 Q39 31 43 38" fill="none" stroke="#D6F7FF" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M28 44 Q32 43 36 44 Q35 48 32 48 Q29 48 28 44 Z" fill="#00B8DD" stroke="#D6F7FF" strokeWidth="0.5" />
          </>
        );
      case 'excited':
        return (
          <>
            <path d="M22 34 L27 38 L22 42" fill="none" stroke="#D6F7FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42 34 L37 38 L42 42" fill="none" stroke="#D6F7FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M28 44 Q32 43 36 44 Q35 49 32 49 Q29 49 28 44 Z" fill="#00B8DD" />
          </>
        );
      case 'wink':
        return (
          <>
            <rect x="22" y="32" width="6" height="11" rx="3" fill={ref('MEye')} />
            <path d="M35 38 Q39 32 43 38" fill="none" stroke="#D6F7FF" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M29 46 Q33 48 36 45" fill="none" stroke="#00B8DD" strokeWidth="1.4" strokeLinecap="round" />
          </>
        );
      case 'thinking':
        return (
          <>
            <rect x="24" y="31" width="6" height="10" rx="3" fill={ref('MEye')} />
            <rect x="38" y="31" width="6" height="10" rx="3" fill={ref('MEye')} />
            <path d="M29 46 Q31 45 33 46 Q35 47 36 46" fill="none" stroke="#00B8DD" strokeWidth="1.2" strokeLinecap="round" />
            <text x="48" y="24" fill="#00B8DD" fontSize="11" fontWeight="bold" fontFamily="sans-serif">?</text>
          </>
        );
      case 'love':
        return (
          <>
            <path d="M25 40 C22 36.5 20 33.5 22.5 31 C24.5 29 25.5 31 25.5 31 C25.5 31 26.5 29 28.5 31 C31 33.5 29 36.5 25 40 Z" fill="#FF4D6D" />
            <path d="M39 40 C36 36.5 34 33.5 36.5 31 C38.5 29 39.5 31 39.5 31 C39.5 31 40.5 29 42.5 31 C45 33.5 43 36.5 39 40 Z" fill="#FF4D6D" />
            <path d="M30 46 Q32 48 34 46" fill="none" stroke="#FF7597" strokeWidth="1.2" strokeLinecap="round" />
          </>
        );
      case 'sad':
        return (
          <>
            <path d="M22 36 Q25 40 28 36" fill="none" stroke="#5CE1FF" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M36 36 Q39 40 42 36" fill="none" stroke="#5CE1FF" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M29 47 Q32 44 35 47" fill="none" stroke="#00B8DD" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="43" cy="42" r="1.6" fill="#5CE1FF" />
          </>
        );
      case 'angry':
        return (
          <>
            <path d="M22 33 L28 37" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M42 33 L36 37" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M29 47 Q32 44 35 47" fill="none" stroke="#EF4444" strokeWidth="1.4" strokeLinecap="round" />
          </>
        );
      case 'sleeping':
        return (
          <>
            <path d="M22 36 Q25 39 28 36" fill="none" stroke="#5CE1FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M36 36 Q39 39 42 36" fill="none" stroke="#5CE1FF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="45" r="1.8" fill="#00B8DD" />
            <text x="47" y="24" fill="#5CE1FF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">z</text>
          </>
        );
      case 'surprised':
        return (
          <>
            <ellipse cx="25" cy="37" rx="4" ry="5.5" fill={ref('MEye')} />
            <ellipse cx="39" cy="37" rx="4" ry="5.5" fill={ref('MEye')} />
            <ellipse cx="32" cy="46" rx="2.5" ry="3.5" fill="#00B8DD" stroke="#D6F7FF" strokeWidth="0.5" />
          </>
        );
      case 'stunned':
        return (
          <>
            {/* Distorted Face: mắt tròn → phình to, kéo dài oval, đồng tử dẹt */}
            <g className="sf-d-eye-l">
              <circle cx="22" cy="38" r="5.5" fill="#FFFFFF" stroke="#00B8DD" strokeWidth="0.6" />
              <circle className="sf-d-pupil-l" cx="22" cy="38" r="2" fill="#1A1210" />
              <circle cx="21.3" cy="37.2" r="0.6" fill="#FFFFFF" fillOpacity="0.7" />
            </g>
            <g className="sf-d-eye-r">
              <circle cx="42" cy="38" r="5.5" fill="#FFFFFF" stroke="#00B8DD" strokeWidth="0.6" />
              <circle className="sf-d-pupil-r" cx="42" cy="38" r="2" fill="#1A1210" />
              <circle cx="41.3" cy="37.2" r="0.6" fill="#FFFFFF" fillOpacity="0.7" />
            </g>
            <path className="sf-d-brow" d="M18.5 30.3 Q22 28.3 25.5 30.3" fill="none" stroke="#E2A55A" strokeWidth="1.2" strokeLinecap="round" />
            <path className="sf-d-brow" d="M38.5 30.3 Q42 28.3 45.5 30.3" fill="none" stroke="#E2A55A" strokeWidth="1.2" strokeLinecap="round" />
            <rect className="sf-d-mouth" x="27" y="47.5" width="10" height="1.8" rx="0.9" fill="#E2A55A" />
          </>
        );
      case 'default':
      default:
        return (
          <>
            <rect x="22" y="32" width="6" height="11" rx="3" fill={ref('MEye')} />
            <rect x="36" y="32" width="6" height="11" rx="3" fill={ref('MEye')} />
            <path d="M29 47 Q32 49 35 47" fill="none" stroke="#00B8DD" strokeWidth="1.2" strokeLinecap="round" />
          </>
        );
    }
  };

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
        <style>{DISTORT_CSS}</style>
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
          
          {renderMiniFace()}

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

  // ── Render Chi Tiết Mắt & Miệng cho Robot Đầy Đủ (lg / xl) ──
  const renderFullFace = () => {
    switch (emotion) {
      case 'happy':
        return (
          <>
            <g filter={ref('Glow')}>
              <path d="M42 75 Q48 64 54 75" fill="none" stroke="#D6F7FF" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M66 75 Q72 64 78 75" fill="none" stroke="#D6F7FF" strokeWidth="3.6" strokeLinecap="round" />
            </g>
            <path
              d="M52 84 Q60 83 68 84 Q67 92 60 92 Q53 92 52 84 Z"
              fill="#00B8DD"
              stroke="#D6F7FF"
              strokeWidth="0.8"
              filter={ref('Soft')}
            />
          </>
        );

      case 'excited':
        return (
          <>
            <g filter={ref('Glow')}>
              <path d="M43 66 L52 72.5 L43 79" fill="none" stroke="#D6F7FF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M77 66 L68 72.5 L77 79" fill="none" stroke="#D6F7FF" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <path
              d="M51 84 Q60 83 69 84 Q68 93 60 93 Q52 93 51 84 Z"
              fill="#00B8DD"
              stroke="#5CE1FF"
              strokeWidth="1"
              filter={ref('Soft')}
            />
          </>
        );

      case 'wink':
        return (
          <>
            <g filter={ref('Glow')}>
              <rect className="sf-eye" x="43" y="64" width="10" height="17" rx="5" fill={ref('Eye')} />
              <path d="M66 74 Q72 65 78 74" fill="none" stroke="#D6F7FF" strokeWidth="3.4" strokeLinecap="round" />
            </g>
            <path
              d="M54 88 Q62 90 67 85"
              fill="none"
              stroke="#00B8DD"
              strokeOpacity="0.9"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </>
        );

      case 'thinking':
        return (
          <>
            <g filter={ref('Glow')}>
              <rect x="46" y="61" width="10" height="15" rx="5" fill={ref('Eye')} />
              <rect x="70" y="61" width="10" height="15" rx="5" fill={ref('Eye')} />
            </g>
            <path
              d="M54 89 Q58 87 61 89 Q64 91 66 89"
              fill="none"
              stroke="#00B8DD"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );

      case 'idea':
        return (
          <>
            <g filter={ref('Glow')}>
              <path d="M42 75 Q48 64 54 75" fill="none" stroke="#D6F7FF" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M66 75 Q72 64 78 75" fill="none" stroke="#D6F7FF" strokeWidth="3.6" strokeLinecap="round" />
            </g>
            <path
              d="M52 84 Q60 83 68 84 Q67 92 60 92 Q53 92 52 84 Z"
              fill="#00B8DD"
              stroke="#D6F7FF"
              strokeWidth="0.8"
              filter={ref('Soft')}
            />
          </>
        );

      case 'love':
        return (
          <>
            <g filter={ref('Glow')}>
              <path
                d="M48 78 C43.5 73.5, 41 69, 44 65 C46.8 62, 48 65, 48 65 C48 65, 49.2 62, 52 65 C55 69, 52.5 73.5, 48 78 Z"
                fill={ref('HeartGrad')}
              />
              <path
                d="M72 78 C67.5 73.5, 65 69, 68 65 C70.8 62, 72 65, 72 65 C72 65, 73.2 62, 76 65 C79 69, 76.5 73.5, 72 78 Z"
                fill={ref('HeartGrad')}
              />
            </g>
            <path
              d="M55 88 Q60 91.5 65 88"
              fill="none"
              stroke="#FF7597"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        );

      case 'celebrate':
        return (
          <>
            <g filter={ref('Glow')}>
              <path d="M42 75 Q48 64 54 75" fill="none" stroke="#D6F7FF" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M66 75 Q72 64 78 75" fill="none" stroke="#D6F7FF" strokeWidth="3.6" strokeLinecap="round" />
            </g>
            <path
              d="M51 84 Q60 83 69 84 Q68 93 60 93 Q52 93 51 84 Z"
              fill="#00B8DD"
              stroke="#5CE1FF"
              strokeWidth="1"
              filter={ref('Soft')}
            />
          </>
        );

      case 'sad':
        return (
          <>
            <g filter={ref('Glow')}>
              <path d="M42 71 Q48 76 54 71" fill="none" stroke="#5CE1FF" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M66 71 Q72 76 78 71" fill="none" stroke="#5CE1FF" strokeWidth="3.4" strokeLinecap="round" />
            </g>
            <path
              d="M54 90 Q60 85 66 90"
              fill="none"
              stroke="#00B8DD"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </>
        );

      case 'angry':
        return (
          <>
            <g filter={ref('Glow')}>
              <polygon points="43,67 54,74 53,79 43,72" fill={ref('AngryGrad')} />
              <polygon points="77,67 66,74 67,79 77,72" fill={ref('AngryGrad')} />
            </g>
            <path
              d="M54 91 Q60 86 66 91"
              fill="none"
              stroke="#FF4D6D"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </>
        );

      case 'sleeping':
        return (
          <>
            <g filter={ref('Glow')}>
              <path d="M43 72 Q48 76.5 53 72" fill="none" stroke="#5CE1FF" strokeWidth="3" strokeLinecap="round" />
              <path d="M67 72 Q72 76.5 77 72" fill="none" stroke="#5CE1FF" strokeWidth="3" strokeLinecap="round" />
            </g>
            <ellipse cx="60" cy="87" rx="3.2" ry="3.8" fill="#00B8DD" stroke="#D6F7FF" strokeWidth="0.8" />
          </>
        );

      case 'surprised':
        return (
          <>
            <g filter={ref('Glow')}>
              <ellipse cx="48" cy="72" rx="7" ry="9.5" fill={ref('Eye')} />
              <ellipse cx="72" cy="72" rx="7" ry="9.5" fill={ref('Eye')} />
            </g>
            <ellipse cx="60" cy="88" rx="4.2" ry="6" fill="#00B8DD" stroke="#D6F7FF" strokeWidth="0.9" />
          </>
        );

      case 'stunned':
        return (
          <>
            {/* Distorted Face: mắt tròn → phình to, kéo dài oval, đồng tử dẹt */}
            <g className="sf-d-eye-l">
              <circle cx="44.5" cy="71" r="9" fill="#FFFFFF" stroke="#00B8DD" strokeWidth="1.1" />
              <circle className="sf-d-pupil-l" cx="44.5" cy="71" r="3.2" fill="#1A1210" />
              <circle cx="43.38" cy="69.72" r="0.96" fill="#FFFFFF" fillOpacity="0.7" />
            </g>
            <g className="sf-d-eye-r">
              <circle cx="75.5" cy="71" r="9" fill="#FFFFFF" stroke="#00B8DD" strokeWidth="1.1" />
              <circle className="sf-d-pupil-r" cx="75.5" cy="71" r="3.2" fill="#1A1210" />
              <circle cx="74.38" cy="69.72" r="0.96" fill="#FFFFFF" fillOpacity="0.7" />
            </g>
            <path className="sf-d-brow" d="M37.5 58.3 Q44.5 56.3 51.5 58.3" fill="none" stroke="#E2A55A" strokeWidth="2.2" strokeLinecap="round" />
            <path className="sf-d-brow" d="M68.5 58.3 Q75.5 56.3 82.5 58.3" fill="none" stroke="#E2A55A" strokeWidth="2.2" strokeLinecap="round" />
            <rect className="sf-d-mouth" x="52" y="89" width="16" height="2.6" rx="1.3" fill="#E2A55A" />
          </>
        );
      case 'default':
      default:
        return (
          <>
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
          </>
        );
    }
  };

  // ── Render Phụ Kiện & Hiệu Ứng Ngoài Lớp Kính (Bóng đèn, Dấu hỏi, Trái tim, Confetti, Giọt lệ, Tay, v.v.) ──
  const renderAccessoriesAndHands = () => {
    switch (emotion) {
      case 'happy':
        return (
          <g>
            {/* Vệt hào quang 2 bên má */}
            <line x1="16" y1="67" x2="23" y2="69" stroke="#00B8DD" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            <line x1="17" y1="73" x2="24" y2="73" stroke="#00B8DD" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            <line x1="104" y1="67" x2="97" y2="69" stroke="#00B8DD" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
            <line x1="103" y1="73" x2="96" y2="73" stroke="#00B8DD" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
          </g>
        );

      case 'excited':
        return (
          <g>
            {/* Tia hào quang năng lượng 2 bên */}
            <line x1="12" y1="66" x2="20" y2="69" stroke="#5CE1FF" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="11" y1="75" x2="19" y2="74" stroke="#5CE1FF" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="108" y1="66" x2="100" y2="69" stroke="#5CE1FF" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="109" y1="75" x2="101" y2="74" stroke="#5CE1FF" strokeWidth="2.2" strokeLinecap="round" />
          </g>
        );

      case 'wink':
        return (
          <g className="sf-spark" transform="translate(105, 42) scale(1.2)">
            {/* Ngôi sao vàng lấp lánh ✨ */}
            <path
              d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z"
              fill="#FBBF24"
              filter={ref('Soft')}
            />
          </g>
        );

      case 'thinking':
        return (
          <g>
            {/* Dấu chấm hỏi phát sáng bay lơ lửng góc trên bên phải */}
            <g className="sf-cap" transform="translate(102, 34)">
              <text
                x="0"
                y="0"
                fill="#00B8DD"
                stroke="#D6F7FF"
                strokeWidth="0.8"
                fontSize="22"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                filter={ref('Glow')}
              >
                ?
              </text>
            </g>
            {/* Tay robot chống cằm bên trái */}
            <g transform="translate(24, 88)">
              <ellipse
                cx="10"
                cy="8"
                rx="8"
                ry="6"
                transform="rotate(-25 10 8)"
                fill={ref('Head')}
                stroke="#00B8DD"
                strokeWidth="1.4"
              />
              <ellipse cx="14" cy="5" rx="4" ry="4" fill="#1B2538" stroke="#5CE1FF" strokeWidth="1" />
            </g>
          </g>
        );

      case 'idea':
        return (
          <g>
            {/* Bóng đèn phát sáng 💡 bên cạnh mũ */}
            <g transform="translate(100, 32)">
              {/* Tia sáng bung tỏa */}
              <line x1="0" y1="-12" x2="0" y2="-17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <line x1="9" y1="-9" x2="13" y2="-13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <line x1="-9" y1="-9" x2="-13" y2="-13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="0" x2="17" y2="0" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              <line x1="-12" y1="0" x2="-17" y2="0" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              {/* Bóng đèn */}
              <circle cx="0" cy="0" r="6.5" fill={ref('BulbGrad')} filter={ref('Soft')} />
              <rect x="-2.5" y="6.5" width="5" height="3" rx="1" fill="#D97706" />
              <path d="M-1.5 9.5 L1.5 9.5" stroke="#B45309" strokeWidth="1" />
            </g>
            {/* Bàn tay vẫy chào bên phải */}
            <g transform="translate(86, 92)">
              <ellipse
                cx="8"
                cy="6"
                rx="8"
                ry="6"
                transform="rotate(30 8 6)"
                fill={ref('Head')}
                stroke="#00B8DD"
                strokeWidth="1.4"
              />
            </g>
          </g>
        );

      case 'love':
        return (
          <g>
            {/* Hai trái tim bay lơ lửng hai bên */}
            <path
              className="sf-spark"
              d="M16 71 C13 67.5, 11 64.5, 13 62 C15 60, 16 62, 16 62 C16 62, 17 60, 19 62 C21 64.5, 19 67.5, 16 71 Z"
              fill="#FF4370"
              opacity="0.9"
              filter={ref('Soft')}
            />
            <path
              className="sf-spark"
              d="M104 69 C101 65.5, 99 62.5, 101 60 C103 58, 104 60, 104 60 C104 60, 105 58, 107 60 C109 62.5, 107 65.5, 104 69 Z"
              fill="#FF4370"
              opacity="0.9"
              filter={ref('Soft')}
            />
            {/* Hai tay ôm cằm say đắm */}
            <ellipse cx="44" cy="98" rx="8" ry="6" fill={ref('Head')} stroke="#FF7597" strokeWidth="1.4" />
            <ellipse cx="76" cy="98" rx="8" ry="6" fill={ref('Head')} stroke="#FF7597" strokeWidth="1.4" />
          </g>
        );

      case 'celebrate':
        return (
          <g>
            {/* Hai tay giơ cao reo hò */}
            <path
              d="M25 94 C20 90, 14 84, 15 76 C17 74, 22 78, 26 86 Z"
              fill={ref('Head')}
              stroke="#00B8DD"
              strokeWidth="1.4"
            />
            <path
              d="M95 94 C100 90, 106 84, 105 76 C103 74, 98 78, 94 86 Z"
              fill={ref('Head')}
              stroke="#00B8DD"
              strokeWidth="1.4"
            />
            {/* Pháo giấy Confetti bung tỏa sắc màu */}
            <rect x="12" y="60" width="3" height="7" rx="1.5" transform="rotate(-30 13 63)" fill="#F59E0B" />
            <rect x="18" y="70" width="3" height="6" rx="1.5" transform="rotate(25 19 73)" fill="#EC4899" />
            <rect x="10" y="80" width="3" height="6" rx="1.5" transform="rotate(-15 11 83)" fill="#10B981" />
            <rect x="104" y="60" width="3" height="7" rx="1.5" transform="rotate(30 105 63)" fill="#EC4899" />
            <rect x="98" y="70" width="3" height="6" rx="1.5" transform="rotate(-20 99 73)" fill="#F59E0B" />
            <rect x="106" y="80" width="3" height="6" rx="1.5" transform="rotate(15 107 83)" fill="#00B8DD" />
          </g>
        );

      case 'sad':
        return (
          <g>
            {/* Giọt nước mắt 💧 rơi ở khóe mắt phải */}
            <path
              className="sf-tear"
              d="M78 82 C76 85, 74 88, 74 90.5 C74 93, 76 95, 78 95 C80 95, 82 93, 82 90.5 C82 88, 80 85, 78 82 Z"
              fill={ref('TearGrad')}
              filter={ref('Soft')}
            />
          </g>
        );

      case 'angry':
        return (
          <g transform="translate(96, 44)">
            {/* Biểu tượng gân giận 💢 màu đỏ */}
            <g filter={ref('Glow')}>
              <path
                d="M3 0 L3 8 M7 0 L7 8 M0 3 L8 3 M0 7 L8 7"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </g>
        );

      case 'sleeping':
        return (
          <g className="sf-zzz">
            {/* Chữ z z Z bay lơ lửng lên */}
            <text x="92" y="48" fill="#5CE1FF" fontSize="10" fontWeight="bold" fontFamily="sans-serif" opacity="0.6">
              z
            </text>
            <text x="98" y="39" fill="#5CE1FF" fontSize="12" fontWeight="bold" fontFamily="sans-serif" opacity="0.8">
              z
            </text>
            <text x="105" y="28" fill="#5CE1FF" fontSize="15" fontWeight="bold" fontFamily="sans-serif" opacity="1" filter={ref('Glow')}>
              Z
            </text>
          </g>
        );

      case 'surprised':
        return (
          <g>
            {/* Vạch giật mình ngạc nhiên ⚡ góc trên bên phải */}
            <line x1="102" y1="36" x2="108" y2="33" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="104" y1="44" x2="111" y2="43" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        );

      case 'stunned':
        return null;

      case 'default':
      default:
        return null;
    }
  };

  // ── Linh vật đầy đủ (nút mở chatbox) ──
  return (
    <div className={cn('relative flex flex-col items-center select-none', className)}>
      <style>{DISTORT_CSS}</style>
      <style>{`
        @keyframes sfFloat {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(2px, -6px) rotate(1deg); }
          50% { transform: translate(-2px, -11px) rotate(-1deg); }
          75% { transform: translate(-3px, -5px) rotate(0.6deg); }
        }
        @keyframes sfCapBob {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-3.5px) rotate(1.5deg); }
        }
        @keyframes sfBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes sfAura {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15) translateY(2px); }
        }
        @keyframes sfTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes sfFlow {
          to { stroke-dashoffset: -24; }
        }
        @keyframes sfTearDrip {
          0%, 100% { transform: translateY(0); opacity: 0.9; }
          60% { transform: translateY(4px); opacity: 1; }
        }
        @keyframes sfZzzFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.7; }
          50% { transform: translate(2px, -3px); opacity: 1; }
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
        .sf-spark { transform-box: fill-box; transform-origin: center; animation: sfTwinkle 2.8s ease-in-out infinite; }
        .sf-flow { animation: sfFlow 2.4s linear infinite; }
        .sf-tear { animation: sfTearDrip 2.2s ease-in-out infinite; }
        .sf-zzz { animation: sfZzzFloat 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .sf-float, .sf-cap, .sf-eye, .sf-aura, .sf-spark, .sf-flow, .sf-tear, .sf-zzz { animation: none; }
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
          <linearGradient id={id('HeartGrad')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF7597" />
            <stop offset="100%" stopColor="#FF2E63" />
          </linearGradient>
          <linearGradient id={id('AngryGrad')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8080" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
          <linearGradient id={id('BulbGrad')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id={id('TearGrad')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E0F7FA" />
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

          {/* Mắt LED & Miệng theo Biểu Cảm */}
          <g ref={eyesRef} className="sf-look">
            {renderFullFace()}
          </g>

          {/* Phụ kiện đính kèm ngoài kính (bóng đèn, dấu hỏi, trái tim, pháo hoa, tay, v.v.) */}
          {renderAccessoriesAndHands()}

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
