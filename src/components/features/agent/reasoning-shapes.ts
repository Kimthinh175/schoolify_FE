/**
 * Hình học thuần cho animation suy luận (không phụ thuộc React/DOM).
 *
 * Luôn có 6 chấm (DOT_COUNT). Sóng và tam giác chỉ có 3 chấm hiển thị: mỗi cặp chấm
 * (2k, 2k+1) nằm chồng khít lên nhau nên nhìn thành 1 chấm. Sang vòng tròn thì cặp tách
 * đôi thành 6 chấm, và khi quay về sóng thì ghép lại thành 3.
 * Mọi chấm cùng cỡ, cùng độ đậm (không có chiều sâu). Các hình xoay chung một góc `spin`
 * nên khi chuyển hình không bị nhảy góc.
 */

export interface Pt {
  x: number;
  y: number;
}

export type ShapeId = 'wave' | 'triangle' | 'hexagon';

export const SHAPE_SEQUENCE: readonly ShapeId[] = ['wave', 'triangle', 'hexagon'];

export const DOT_COUNT = 6;
export const DOT_RADIUS = 2.6;
export const VIEWBOX = 40;
export const HOLD_MS = 1300;
export const TRANSITION_MS = 1100;
export const STAGGER_MS = 70;
/** Một chặng = giữ hình + chuyển sang hình kế (kể cả độ trễ của chấm cuối) */
export const SEGMENT_MS = HOLD_MS + TRANSITION_MS + (DOT_COUNT - 1) * STAGGER_MS;

const C = VIEWBOX / 2;
const SPIN_RATE = 0.0018; // rad/ms
const RING_RADIUS = 12;
const EDGE_MARGIN = 2.5;

function polar(angle: number, radius: number): Pt {
  return { x: C + radius * Math.cos(angle), y: C + radius * Math.sin(angle) };
}

/** 6 điểm của một hình tại thời điểm tMs. Luôn trả đúng DOT_COUNT phần tử. */
export function getShapePoints(shape: ShapeId, tMs: number): Pt[] {
  const spin = tMs * SPIN_RATE;
  const base = spin - Math.PI / 2;
  const pts: Pt[] = [];

  for (let i = 0; i < DOT_COUNT; i++) {
    const k = Math.floor(i / 2); // chỉ số của chấm hiển thị trong hình 3 chấm

    if (shape === 'wave') {
      pts.push({
        x: 9 + k * 11,
        y: C + 7 * Math.sin(tMs * 0.006 - k * 1.1),
      });
    } else if (shape === 'triangle') {
      pts.push(polar(base + k * ((2 * Math.PI) / 3), RING_RADIUS));
    } else {
      // Chấm chẵn trùng đỉnh tam giác, chấm lẻ tách ra nằm giữa 2 đỉnh trên đường tròn
      pts.push(polar(base + i * (Math.PI / 3), RING_RADIUS));
    }
  }

  return pts;
}

/** easeInOutBack biên độ nhỏ (nảy nhẹ, không rung giật). */
export function easeInOutBack(x: number): number {
  const c1 = 0.9;
  const c2 = c1 * 1.525;
  const v = Math.min(1, Math.max(0, x));
  return v < 0.5
    ? (Math.pow(2 * v, 2) * ((c2 + 1) * 2 * v - c2)) / 2
    : (Math.pow(2 * v - 2, 2) * ((c2 + 1) * (2 * v - 2) + c2) + 2) / 2;
}

/** Tiến độ của từng chấm trong lúc chuyển hình (mỗi chấm trễ i·STAGGER_MS). */
export function staggerProgress(elapsedMs: number): number[] {
  return Array.from({ length: DOT_COUNT }, (_, i) =>
    easeInOutBack((elapsedMs - i * STAGGER_MS) / TRANSITION_MS),
  );
}

/** Nội suy từng chấm theo tiến độ riêng; tọa độ được giữ trong viewBox. */
export function morphPoints(from: Pt[], to: Pt[], progress: number[]): Pt[] {
  const clampXY = (v: number) => Math.min(VIEWBOX - EDGE_MARGIN, Math.max(EDGE_MARGIN, v));
  return from.map((f, i) => ({
    x: clampXY(f.x + (to[i].x - f.x) * progress[i]),
    y: clampXY(f.y + (to[i].y - f.y) * progress[i]),
  }));
}

/** Toàn bộ khung hình tại thời điểm tMs (hàm thuần, vòng lặp vô hạn qua SHAPE_SEQUENCE). */
export function getFramePoints(tMs: number): Pt[] {
  const t = Math.max(0, tMs);
  const stage = Math.floor(t / SEGMENT_MS);
  const local = t - stage * SEGMENT_MS;
  const k = stage % SHAPE_SEQUENCE.length;
  const next = (k + 1) % SHAPE_SEQUENCE.length;

  const from = getShapePoints(SHAPE_SEQUENCE[k], t);
  if (local < HOLD_MS) return from;

  const to = getShapePoints(SHAPE_SEQUENCE[next], t);

  return morphPoints(from, to, staggerProgress(local - HOLD_MS));
}
