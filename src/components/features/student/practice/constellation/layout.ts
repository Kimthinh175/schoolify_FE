/**
 * Bố cục chòm sao: sinh vị trí các ngôi sao theo SỐ CHƯƠNG THẬT của nhánh đang xem
 * (Toán 12: 8 cụm chương, Toán 11: 11 cụm chương, Tin 6-7 chương, ...).
 *
 * - Desktop: dải ngang có thể kéo/lướt mượt sang trái-phải (pad hai đầu đủ rộng),
 *   nhãn nằm phía trên mỗi ngôi sao để khoảng không ngay dưới ngôi sao luôn thoáng cho thẻ chi tiết nổi tại vị trí sao đang chọn.
 * - Mobile: xếp dọc zigzag, thẻ chi tiết mở ngay tại chương đang chọn, không scroll ngang.
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

/** Trích nhãn "Chương X" / "Chương 2A" chuẩn SGK và khóa sắp xếp từ tên chương */
export function parseChapterSortAndLabel(
  name: string,
  fallbackOrder: number,
): { sortKey: number; eyebrow: string } {
  const m = (name || '').trim().match(/^Chương\s+(\d+)([A-Z]?)\b/i);
  if (!m) {
    return {
      sortKey: fallbackOrder * 10,
      eyebrow: `Chương ${fallbackOrder}`,
    };
  }
  const num = parseInt(m[1], 10);
  const suffix = (m[2] || '').toUpperCase();
  const subOffset = suffix ? suffix.charCodeAt(0) - 64 : 0;
  return {
    sortKey: num * 10 + subOffset,
    eyebrow: `Chương ${num}${suffix}`,
  };
}

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

  const H = 580;
  const padLeft = 185;
  const padRight = 235;
  const stepX = n <= 4 ? 270 : 250;
  const W =
    n === 1
      ? 1160
      : Math.max(1160, Math.round(padLeft + (n - 1) * stepX + padRight));

  const span = Math.max(0, W - padLeft - padRight);
  const pos: StarPos[] = Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const x = n === 1 ? W / 2 : padLeft + t * span;
    const rawY =
      272 - Math.sin(t * Math.PI) * 24 + Math.sin(i * 1.65 + seed) * 22;
    const y = Math.max(235, Math.min(310, Math.round(rawY)));
    return {
      x: Math.round(x),
      y,
      lx: Math.round(x),
      ly: y - 62,
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
