/**
 * Bố cục chòm sao: sinh vị trí các ngôi sao theo SỐ CHƯƠNG THẬT của nhánh đang xem
 * (Toán Số 4, Toán Hình 4, Tin 6, ... — không cố định).
 *
 * - Desktop: các sao chạy từ trái-dưới lên phải-trên (hình chòm sao), nhãn luân phiên dưới/trên
 *   để không chồng nhau; các sao ở vùng bên phải luôn đặt nhãn phía trên để tránh thẻ chi tiết (góc phải dưới).
 * - Mobile: xếp dọc zigzag, nhãn nằm dưới mỗi sao, chiều cao bản đồ co giãn theo số chương.
 */

export type SkyTheme = 'so' | 'hinh' | 'tin';

export interface StarPos {
  x: number;
  y: number;
  /** Tọa độ dòng nhãn đầu tiên (căn giữa theo x) */
  lx: number;
  ly: number;
}

export interface SkyLayout {
  w: number;
  h: number;
  /** Hệ số phóng chữ/sao để vẫn đọc được khi viewBox bị thu nhỏ trên mobile */
  fs: number;
  pos: StarPos[];
}

/** Jitter xác định (không random) theo môn để mỗi chòm sao có "dáng" riêng */
const JITTER_SEED: Record<SkyTheme, number> = { so: 0.7, hinh: 2.1, tin: 3.9 };

export function buildLayout(count: number, mobile: boolean, theme: SkyTheme): SkyLayout {
  const n = Math.max(1, count);
  const seed = JITTER_SEED[theme];

  if (mobile) {
    const stepY = 112;
    const h = n * stepY + 60;
    const pos: StarPos[] = Array.from({ length: n }, (_, i) => {
      const x = n === 1 ? 200 : i % 2 === 0 ? 105 : 295;
      const y = 62 + i * stepY;
      return { x, y, lx: x, ly: y + 56 };
    });
    return { w: 400, h, fs: 1.15, pos };
  }

  const W = 1160;
  const H = 580;
  const pos: StarPos[] = Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = n === 1 ? W / 2 : 130 + t * 900;
    const base = 350 - 120 * t;
    const odd = i % 2 === 1;
    const jitter = odd ? Math.sin(i * 2.3 + seed) * 16 : 0;
    const y = Math.round(odd ? base + 20 + jitter : base);
    const labelAbove = odd || x > 740;
    return {
      x: Math.round(x),
      y,
      lx: Math.round(x),
      ly: labelAbove ? y - 64 : y + 52,
    };
  });
  return { w: W, h: H, fs: 1, pos };
}

/** Ngắt tên chương thành tối đa 2 dòng (cắt bằng dấu … nếu vẫn quá dài) */
export function wrapLabel(text: string, max = 18): [string, string] {
  const words = text.trim().split(/\s+/);
  let first = '';
  let i = 0;
  for (; i < words.length; i++) {
    const next = first ? `${first} ${words[i]}` : words[i];
    if (next.length > max && first) break;
    first = next;
  }
  let second = words.slice(i).join(' ');
  if (second.length > max + 2) second = `${second.slice(0, max)}…`;
  return [first, second];
}
