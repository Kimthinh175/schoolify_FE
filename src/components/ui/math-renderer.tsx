'use client';

import * as React from 'react';
import katex from 'katex';
import { cn } from '@/lib/utils';

/**
 * Chuẩn hóa các cú pháp thân thiện, dễ gõ/dễ chỉnh sửa thành mã lệnh LaTeX chuẩn.
 * Ví dụ:
 *  - Lũy thừa: x^[N], x^[n], x^[2], (x+1)^[2] => x^{N}, x^{n}, x^{2}, (x+1)^{2}
 *  - Chỉ số dưới: x_[1], x_[n], v_[0], F_[ms] => x_{1}, x_{n}, v_{0}, F_{ms}
 *  - Căn bậc hai: √(x), √[x], √x => \sqrt{x}
 *  - Căn bậc ba: ∛(x), ∛[x] => \sqrt[3]{x}
 *  - Phân số: (a)/(b), [a]/[b] => \frac{a}{b}
 *  - Vectơ: F⃗, v⃗, a⃗, u⃗, AB⃗ => \vec{F}, \vec{v}, \vec{a}, \vec{u}, \vec{AB}
 *  - Ký hiệu vật lý & toán: Ω => \Omega, λ => \lambda, ω => \omega, Δ => \Delta, π => \pi, ° => ^\circ
 */
export function normalizeMathExpression(raw: string): string {
  if (!raw) return '';

  return (
    raw
      // 1. Lũy thừa dễ chỉnh: x^[N], x^[n], y^[2], (2x+1)^[k+1], 10^[-3]
      .replace(/\^\[([^\]]+)\]/g, '^{$1}')
      // 2. Chỉ số dưới dễ chỉnh: x_[1], v_[0], F_[ms], y_[CĐ]
      .replace(/_\[([^\]]+)\]/g, '_{$1}')
      // 3. Căn thức: √(x), √[x], ∛(x), ∛[x]
      .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
      .replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}')
      .replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}')
      .replace(/∛\[([^\]]+)\]/g, '\\sqrt[3]{$1}')
      // 4. Phân số dễ chỉnh: (a)/(b), [a]/[b], (2x - 1)/(x + 1)
      .replace(
        /\(([a-zA-Z0-9+\-*^_{}\s\\]+)\)\s*\/\s*\(([a-zA-Z0-9+\-*^_{}\s\\]+)\)/g,
        '\\frac{$1}{$2}'
      )
      .replace(
        /\[([a-zA-Z0-9+\-*^_{}\s\\]+)\]\s*\/\s*\[([a-zA-Z0-9+\-*^_{}\s\\]+)\]/g,
        '\\frac{$1}{$2}'
      )
      // 5. Vectơ: F⃗, v⃗, a⃗, u⃗, AB⃗
      .replace(/([A-Za-z]{1,2})⃗/g, '\\vec{$1}')
      // 6. Ký hiệu Vật Lý & Toán phổ thông
      .replace(/Ω/g, '\\Omega ')
      .replace(/Δ/g, '\\Delta ')
      .replace(/π/g, '\\pi ')
      .replace(/λ/g, '\\lambda ')
      .replace(/ω/g, '\\omega ')
      .replace(/μ/g, '\\mu ')
      .replace(/ρ/g, '\\rho ')
      .replace(/°/g, '^\\circ ')
      .replace(/±/g, '\\pm ')
      .replace(/≠/g, '\\neq ')
      .replace(/≤/g, '\\le ')
      .replace(/≥/g, '\\ge ')
      .replace(/≈/g, '\\approx ')
      .replace(/∞/g, '\\infty ')
  );
}

/**
 * Render một biểu thức toán học LaTeX thành chuỗi HTML KaTeX an toàn.
 */
export function renderKatex(expr: string, displayMode = false): string {
  try {
    const normalized = normalizeMathExpression(expr.trim());
    return katex.renderToString(normalized, {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
      strict: false,
    });
  } catch {
    return expr;
  }
}

/**
 * Phân tích đoạn văn bản chứa hỗn hợp giữa câu chữ tiếng Việt và công thức toán học/vật lý.
 * Hỗ trợ cả hai chế độ:
 *  1. Có bọc dấu $...$ hoặc $$...$$
 *  2. Chứa cú pháp toán độc lập như: x^[N], x^[2], √(x), (a)/(b), \vec{F}, \Omega, \lambda, v.v.
 */
export function parseAndRenderMath(text: string): string {
  if (!text) return '';

  // Chuyển đổi escape newline \\n thành newline thực nếu có
  const cleanText = text.replace(/\\n/g, '\n');

  // Regex nhận diện công thức bọc bởi $$...$$ (khối) hoặc $...$ (nội dòng)
  const mathDelimiterRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  const parts: { type: 'text' | 'math-inline' | 'math-block'; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathDelimiterRegex.exec(cleanText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: cleanText.substring(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('$$') && token.endsWith('$$')) {
      parts.push({ type: 'math-block', content: token.slice(2, -2) });
    } else {
      parts.push({ type: 'math-inline', content: token.slice(1, -1) });
    }
    lastIndex = mathDelimiterRegex.lastIndex;
  }

  if (lastIndex < cleanText.length) {
    parts.push({ type: 'text', content: cleanText.substring(lastIndex) });
  }

  // Regex nhận diện các ký hiệu dễ chỉnh độc lập nằm trong plain text (ngoài dấu $)
  // Ví dụ: x^[N], (x+1)^[2], x_[1], (2x-1)/(x+1), √(x), F⃗, \vec{F}, v_[0], 50 Ω
  const standaloneShorthandRegex =
    /((?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)?\^\[[^\]]+\]|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)?_\[[^\]]+\]|√\([^)]+\)|√\[[^\]]+\]|∛\([^)]+\)|∛\[[^\]]+\]|\([a-zA-Z0-9+\-*^_{}\s\\]+\)\s*\/\s*\([a-zA-Z0-9+\-*^_{}\s\\]+\)|\[[a-zA-Z0-9+\-*^_{}\s\\]+\]\s*\/\s*\[[a-zA-Z0-9+\-*^_{}\s\\]+\]|[A-Za-z]{1,2}⃗|\\[a-zA-Z]+(?:\{[^}]*\})*|\b\d+\s*Ω)/g;

  return parts
    .map((part) => {
      if (part.type === 'math-block') {
        return `<div class="my-2 overflow-x-auto py-1">${renderKatex(part.content, true)}</div>`;
      }
      if (part.type === 'math-inline') {
        return renderKatex(part.content, false);
      }

      // Xử lý plain text: render các ký hiệu viết tắt x^[N] thành KaTeX
      let textChunk = part.content;
      textChunk = textChunk.replace(standaloneShorthandRegex, (matched) => {
        try {
          return renderKatex(matched, false);
        } catch {
          return matched;
        }
      });

      return textChunk;
    })
    .join('');
}

export interface MathRendererProps {
  text?: string | null;
  content?: string | null;
  className?: string;
  inline?: boolean;
}

/**
 * Component hiển thị công thức toán học và vật lý chuẩn GDPT 2018
 */
export const MathRenderer: React.FC<MathRendererProps> = React.memo(
  ({ text, content, className, inline = false }) => {
    const targetText = text ?? content ?? '';
    const html = React.useMemo(() => parseAndRenderMath(targetText), [targetText]);

    if (inline) {
      return (
        <span
          className={cn('inline-math leading-relaxed', className)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <div
        className={cn('math-content leading-relaxed', className)}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);

MathRenderer.displayName = 'MathRenderer';
