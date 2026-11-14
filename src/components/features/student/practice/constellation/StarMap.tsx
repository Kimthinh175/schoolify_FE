'use client';

import * as React from 'react';
import styles from './constellation.module.css';
import { wrapLabel, type SkyLayout } from './layout';

/**
 * done : chương đã pass            → chấm tròn XANH LÁ phát sáng
 * cur  : chương đang ở (frontier)  → NGÔI SAO ✦
 * open : mở sẵn nhưng chưa pass    → vòng cyan mảnh
 * lock : chưa mở                   → chấm mờ
 */
export type StarState = 'done' | 'cur' | 'open' | 'lock';

export interface StarChapter {
  id: number;
  order: number;
  shortName: string;
  name: string;
  state: StarState;
}

interface StarMapProps {
  layout: SkyLayout;
  mobile: boolean;
  chapters: StarChapter[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const STATE_LABEL: Record<StarState, string> = {
  done: 'đã đạt',
  cur: 'đang học',
  open: 'đã mở',
  lock: 'chưa mở',
};

function Star({ state, x, y, k }: { state: StarState; x: number; y: number; k: number }) {
  if (state === 'done') {
    return (
      <>
        <circle cx={x} cy={y} r={26 * k} fill="url(#cs-glow-g)" />
        <g className={styles.core}>
          <circle cx={x} cy={y} r={8 * k} fill="#10B981" />
          <circle cx={x} cy={y} r={8 * k} fill="none" stroke="#6EE7B7" strokeOpacity=".7" strokeWidth="1.5" />
          <circle cx={x - 2 * k} cy={y - 2.5 * k} r={2.4 * k} fill="#D1FAE5" opacity=".9" />
        </g>
      </>
    );
  }
  if (state === 'cur') {
    const rays: Array<[number, number]> = [
      [0, -44], [-42, -16], [42, -8], [-30, 32], [34, 28],
    ];
    return (
      <>
        <circle cx={x} cy={y} r={40 * k} fill="url(#cs-glow-c)">
          <animate attributeName="r" values={`${34 * k};${46 * k};${34 * k}`} dur="3.2s" repeatCount="indefinite" />
        </circle>
        <g stroke="#5CE1FF" strokeOpacity=".45" strokeWidth="1" strokeLinecap="round">
          {rays.map(([dx, dy]) => (
            <line key={`${dx}${dy}`} x1={x} y1={y} x2={x + dx * k} y2={y + dy * k} />
          ))}
          <animate attributeName="stroke-opacity" values=".15;.6;.15" dur="3.6s" repeatCount="indefinite" />
        </g>
        <g className={styles.core}>
          <path
            transform={`translate(${x} ${y}) scale(${k})`}
            d="M0-19 L3-3 L19 0 L3 3 L0 19 L-3 3 L-19 0 L-3-3Z"
            fill="#fff"
          />
          <circle cx={x} cy={y} r={4.5 * k} fill="#fff" />
        </g>
      </>
    );
  }
  if (state === 'open') {
    return (
      <g className={styles.core}>
        <circle cx={x} cy={y} r={7 * k} fill="#0E1626" stroke="#00B8DD" strokeWidth="2" />
        <circle cx={x} cy={y} r={2.2 * k} fill="#5CE1FF" />
      </g>
    );
  }
  return (
    <g className={styles.core}>
      <circle cx={x} cy={y} r={4.5 * k} fill="#0E1626" stroke="#64748B" strokeWidth="1.5" />
    </g>
  );
}

export function StarMap({ layout, mobile, chapters, selectedId, onSelect }: StarMapProps) {
  const k = layout.fs;
  const { pos } = layout;
  const wrapAt = mobile ? 22 : 18;

  const segments = chapters.slice(0, -1).map((c, i) => {
    const a = pos[i];
    const b = pos[i + 1];
    const next = chapters[i + 1];
    if (!a || !b) return null;
    const bright = c.state !== 'lock' && next.state !== 'lock';
    return { a, b, bright, from: c.state, to: next.state, toCur: next.state === 'cur', i };
  });

  return (
    <svg
      className={styles.map}
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="Các chương là những ngôi sao"
      style={mobile ? { aspectRatio: `${layout.w} / ${layout.h}` } : undefined}
    >
      <defs>
        <radialGradient id="cs-glow-c">
          <stop offset="0" stopColor="#00B8DD" stopOpacity=".8" />
          <stop offset="1" stopColor="#00B8DD" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="cs-glow-g">
          <stop offset="0" stopColor="#10B981" stopOpacity=".75" />
          <stop offset="1" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
        {segments.map(
          (s) =>
            s &&
            s.bright && (
              <linearGradient
                key={s.i}
                id={`cs-seg-${s.i}`}
                gradientUnits="userSpaceOnUse"
                x1={s.a.x}
                y1={s.a.y}
                x2={s.b.x}
                y2={s.b.y}
              >
                <stop offset="0" stopColor={s.from === 'done' ? '#10B981' : '#5CE1FF'} />
                <stop offset="1" stopColor={s.to === 'done' ? '#10B981' : '#5CE1FF'} />
              </linearGradient>
            ),
        )}
      </defs>

      {segments.map(
        (s) =>
          s && (
            <React.Fragment key={s.i}>
              {s.bright ? (
                <line
                  x1={s.a.x}
                  y1={s.a.y}
                  x2={s.b.x}
                  y2={s.b.y}
                  stroke={`url(#cs-seg-${s.i})`}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <line
                  x1={s.a.x}
                  y1={s.a.y}
                  x2={s.b.x}
                  y2={s.b.y}
                  stroke="#94A3B8"
                  strokeOpacity=".32"
                  strokeWidth="1.5"
                  strokeDasharray="3 7"
                  strokeLinecap="round"
                />
              )}
              {s.bright && s.toCur && (
                <circle r="2.6" fill="#fff">
                  <animateMotion
                    dur="2.4s"
                    repeatCount="indefinite"
                    path={`M${s.a.x} ${s.a.y} L${s.b.x} ${s.b.y}`}
                  />
                </circle>
              )}
            </React.Fragment>
          ),
      )}

      {chapters.map((c, i) => {
        const p = pos[i];
        if (!p) return null;
        const on = selectedId === c.id;
        const [l1, l2] = wrapLabel(c.shortName, wrapAt);
        const eyebrow =
          c.state === 'lock' ? '#64748B' : c.state === 'cur' ? '#5CE1FF' : c.state === 'done' ? '#34D399' : '#94A3B8';
        const title = c.state === 'lock' ? '#64748B' : c.state === 'cur' ? '#fff' : '#E2E8F0';
        const weight = c.state === 'cur' ? 700 : 600;
        const select = () => onSelect(c.id);

        return (
          <g
            key={c.id}
            className={styles.st}
            tabIndex={0}
            role="button"
            aria-label={`Chương ${c.order}: ${c.name} — ${STATE_LABEL[c.state]}`}
            aria-pressed={on}
            onClick={select}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
              }
            }}
          >
            <Star state={c.state} x={p.x} y={p.y} k={k} />
            {on && (
              <circle
                cx={p.x}
                cy={p.y}
                r={27 * k}
                fill="none"
                stroke="#fff"
                strokeOpacity=".55"
                strokeWidth="1"
                strokeDasharray="2 5"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${p.x} ${p.y}`}
                  to={`360 ${p.x} ${p.y}`}
                  dur="24s"
                  repeatCount="indefinite"
                />
              </circle>
            )}
            <circle className={styles.hit} cx={p.x} cy={p.y} r={30 * k} />
            <g textAnchor="middle">
              <text x={p.lx} y={p.ly} fontSize={10.5 * k} fontWeight={700} letterSpacing={1.2} fill={eyebrow}>
                CHƯƠNG {c.order}
              </text>
              <text x={p.lx} y={p.ly + 17 * k} fontSize={14 * k} fontWeight={weight} fill={title}>
                {l1}
              </text>
              {l2 && (
                <text x={p.lx} y={p.ly + 34 * k} fontSize={14 * k} fontWeight={weight} fill={title}>
                  {l2}
                </text>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
}
