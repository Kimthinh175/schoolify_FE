'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  DOT_COUNT,
  DOT_RADIUS,
  VIEWBOX,
  getFramePoints,
  getShapePoints,
} from './reasoning-shapes';

export interface ReasoningStep {
  title: string;
  desc: string;
  tag?: string;
  icon?: 'analyze' | 'knowledge' | 'trap' | 'socratic';
}

export interface MessageThinking {
  durationSeconds: number;
  steps: ReasoningStep[];
  summary?: string;
}

export interface AgentReasoningProcessProps {
  isLive?: boolean;
  currentQuery?: string;
  questionContext?: Record<string, any>;
  thinking?: MessageThinking;
  className?: string;
}

/**
 * Helper trích xuất các bước tư duy (giữ tương thích API)
 */
export function deriveReasoningSteps(
  _query?: string,
  _context?: Record<string, any>
): ReasoningStep[] {
  return [
    { title: 'Dựng mô hình hình học', desc: 'Xác định các điểm, đường thẳng và mặt phẳng.' },
    { title: 'Xử lý quan hệ không gian', desc: 'Kiểm tra quan hệ song song, vuông góc.' },
    { title: 'Tính toán & Lập luận', desc: 'Áp dụng định lý hình học và giải tích.' },
    { title: 'Hoàn thiện lời giải', desc: 'Tổng kết kết quả chuẩn KaTeX.' },
  ];
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * AgentReasoningProcess:
 * Hoạt ảnh chấm hình học chuyển hình mượt qua chuỗi:
 * sóng (3 chấm) → tam giác xoay (3 chấm) → tách đôi thành vòng tròn 6 chấm quay → ghép lại thành sóng...
 * Hình học nằm ở `reasoning-shapes.ts` (hàm thuần); component này chỉ ghi DOM SVG mỗi khung hình.
 *
 * Tuyệt đối không nền, không viền, không chữ; mọi chấm cùng cỡ, cùng màu đen.
 */
export function AgentReasoningProcess({
  isLive = false,
  className,
}: AgentReasoningProcessProps) {
  const circlesRef = React.useRef<(SVGCircleElement | null)[]>([]);
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  React.useEffect(() => {
    if (!isLive || reducedMotion) return;

    let animId = 0;
    let startMs: number | null = null;

    // requestAnimationFrame tự tạm dừng khi tab bị ẩn, nên không tốn CPU nền
    const renderLoop = (timeMs: number) => {
      if (startMs === null) startMs = timeMs;
      const pts = getFramePoints(timeMs - startMs);

      // Ghi thẳng DOM SVG (mượt 60 FPS, không re-render React)
      for (let i = 0; i < DOT_COUNT; i++) {
        const circle = circlesRef.current[i];
        const p = pts[i];
        if (circle && p) {
          circle.setAttribute('cx', p.x.toFixed(2));
          circle.setAttribute('cy', p.y.toFixed(2));
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isLive, reducedMotion]);

  // Khi AI đã trả lời xong, hoàn toàn không hiển thị để giữ tin nhắn sạch sẽ
  if (!isLive) {
    return null;
  }

  // Vị trí khởi tạo (và vị trí tĩnh khi người dùng chọn giảm chuyển động)
  const initial = getShapePoints(reducedMotion ? 'hexagon' : 'wave', 0);

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center bg-transparent border-0 shadow-none outline-none select-none',
        className
      )}
      role="status"
      aria-label="AI đang suy luận..."
    >
      <svg
        className={cn('w-10 h-10', reducedMotion && 'animate-pulse')}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {initial.map((p, i) => (
          <circle
            key={`reasoning-dot-${i}`}
            ref={(el) => {
              circlesRef.current[i] = el;
            }}
            cx={p.x}
            cy={p.y}
            r={DOT_RADIUS}
            className="fill-slate-900 dark:fill-white"
          />
        ))}
      </svg>
    </div>
  );
}

