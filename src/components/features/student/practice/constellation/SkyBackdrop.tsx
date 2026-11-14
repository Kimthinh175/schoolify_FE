'use client';

import * as React from 'react';
import styles from './constellation.module.css';
import type { SkyTheme } from './layout';

/**
 * Nền bầu trời TĨNH theo chủ đề môn (không animation, không parallax):
 * - so   : Toán Số  — navy–cyan, lưới chấm, công thức khớp các chương (∑ ∫ π √x f′(x) σ² …)
 * - hinh : Toán Hình — bản vẽ kỹ thuật (blueprint), hình học vẽ nét mảnh
 * - tin  : Tin học  — terminal chàm–tím, đoạn mã và các cột 0/1 tĩnh
 */

/** [left%, top%, nội dung, cỡ chữ px, góc độ, độ mờ] */
const DECO_SO: Array<[number, number, string, number, number, number]> = [
  [6, 58, '∑', 84, -6, 0.17], [87, 24, '∫', 112, 8, 0.15], [44, 72, 'π', 72, -10, 0.16],
  [27, 9, '√x', 46, -4, 0.16], [52, 19, 'f′(x)', 40, 5, 0.14], [15, 30, 'lim', 38, -6, 0.14],
  [50, 40, 'x²+1', 34, 6, 0.13], [42, 84, 'eˣ', 54, -8, 0.14], [72, 47, 'P(A|B)', 32, 4, 0.13],
  [3, 40, 'σ²', 52, 6, 0.15], [91, 58, 'dx', 36, -6, 0.13], [30, 68, 'Δ', 50, 10, 0.11],
];

const SHAPES: Record<string, string> = {
  tri: '<path d="M10 88 L90 88 L50 14Z M50 14 L50 88"/><path d="M44 88 v-6 h6"/><text x="4" y="98">A</text><text x="88" y="98">B</text><text x="46" y="10">C</text>',
  circ: '<circle cx="50" cy="50" r="40"/><path d="M50 50 L84 30"/><path d="M50 10 L90 50 L50 90 L10 50Z"/><circle cx="50" cy="50" r="1.6"/><text x="53" y="47">O</text>',
  cube: '<path d="M22 38 H62 V78 H22Z M22 38 L42 18 H82 L62 38 M82 18 V58 L62 78"/><path d="M42 18 V58 L22 78 M42 58 H82" stroke-dasharray="3 3"/>',
  axes: '<path d="M50 54 V8 M50 54 H94 M50 54 L16 88"/><path d="M46 14 L50 8 L54 14 M88 50 L94 54 L88 58 M22 86 L16 88 L18 82"/><text x="53" y="14">z</text><text x="90" y="46">y</text><text x="10" y="96">x</text><text x="53" y="66">O</text>',
  plane: '<path d="M8 72 L58 72 L92 42 L42 42Z"/><path d="M50 57 V14 M46 20 L50 14 L54 20"/><circle cx="50" cy="57" r="1.8"/><text x="54" y="22">n</text>',
  vec: '<path d="M12 80 L80 24 M12 80 L88 70"/><path d="M72 26 L80 24 L78 32 M80 66 L88 70 L80 74"/><path d="M36 64 A28 28 0 0 1 41 75"/><text x="58" y="42">a</text><text x="86" y="62">b</text>',
};

/** [left%, top%, kích thước px, góc độ, độ mờ, hình] */
const DECO_HINH: Array<[number, number, number, number, number, keyof typeof SHAPES]> = [
  [2, 48, 150, -4, 0.26, 'cube'], [46, 6, 120, 3, 0.24, 'tri'], [84, 16, 130, 0, 0.22, 'circ'],
  [24, 60, 100, 0, 0.26, 'axes'], [50, 72, 150, -2, 0.22, 'plane'], [56, 34, 96, 6, 0.2, 'vec'],
];

/** [left%, top%, nội dung, cỡ chữ px, độ mờ] */
const DECO_TIN: Array<[number, number, string, number, number]> = [
  [3, 30, 'SELECT * FROM hs;', 18, 0.19], [60, 15, 'for i in range(n):', 18, 0.18],
  [24, 17, "print('Hello')", 20, 0.17], [50, 60, 'if x > 0:', 20, 0.17], [44, 88, '192.168.0.1', 17, 0.17],
  [88, 62, '</>', 46, 0.16], [33, 40, '{ }', 52, 0.15], [50, 7, '0x1F', 24, 0.15],
  [70, 66, 'NULL', 22, 0.16], [60, 78, 'while True:', 18, 0.15], [94, 12, '&&', 30, 0.14],
  [80, 53, 'def f(x):', 18, 0.13],
];

/** Random xác định (cùng kết quả ở server & client → không lệch hydration) */
function seeded(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function useBackdropData() {
  return React.useMemo(() => {
    const r = seeded(7);
    const stars = Array.from({ length: 110 }, () => {
      const o = (0.2 + r() * 0.5).toFixed(2);
      const z = (0.6 + r() * 1.3).toFixed(1);
      return { l: (r() * 100).toFixed(1), t: (r() * 100).toFixed(1), z, o };
    });
    const q = seeded(11);
    const columns = [6, 19, 33, 49, 63, 78, 92].map((left) => {
      let digits = '';
      for (let j = 0; j < 48; j++) digits += (q() < 0.5 ? '0' : '1') + '\n';
      return { left, digits, opacity: (0.11 + q() * 0.08).toFixed(2) };
    });
    return { stars, columns };
  }, []);
}

export function SkyBackdrop({ theme }: { theme: SkyTheme }) {
  const { stars, columns } = useBackdropData();

  const tbgClass =
    theme === 'so' ? styles.tbgSo : theme === 'hinh' ? styles.tbgHinh : styles.tbgTin;
  const decoClass =
    theme === 'so' ? styles.decoSo : theme === 'hinh' ? styles.decoHinh : styles.decoTin;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className={`${styles.tbg} ${tbgClass}`} />
      <div className={styles.stars}>
        {stars.map((s, i) => (
          <i
            key={i}
            style={{ left: `${s.l}%`, top: `${s.t}%`, width: `${s.z}px`, height: `${s.z}px`, opacity: s.o }}
          />
        ))}
      </div>
      <div className={`${styles.deco} ${decoClass}`}>
        {theme === 'so' &&
          DECO_SO.map(([l, t, x, s, r, o]) => (
            <span
              key={x}
              className={styles.t}
              style={{
                left: `${l}%`,
                top: `${t}%`,
                opacity: o,
                transform: `rotate(${r}deg)`,
                ['--fs' as string]: s,
              }}
            >
              {x}
            </span>
          ))}
        {theme === 'hinh' &&
          DECO_HINH.map(([l, t, w, r, o, k]) => (
            <svg
              key={k}
              className={styles.g}
              viewBox="0 0 100 100"
              style={{
                left: `${l}%`,
                top: `${t}%`,
                width: `calc(${w}px * var(--ds, 1))`,
                height: `calc(${w}px * var(--ds, 1))`,
                opacity: o,
                transform: `rotate(${r}deg)`,
              }}
              dangerouslySetInnerHTML={{ __html: SHAPES[k] }}
            />
          ))}
        {theme === 'tin' && (
          <>
            {DECO_TIN.map(([l, t, x, s, o]) => (
              <span
                key={x}
                className={styles.t}
                style={{ left: `${l}%`, top: `${t}%`, opacity: o, ['--fs' as string]: s }}
              >
                {x}
              </span>
            ))}
            {columns.map((c) => (
              <div
                key={c.left}
                className={styles.rain}
                style={{ left: `${c.left}%`, opacity: c.opacity }}
              >
                {c.digits}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
