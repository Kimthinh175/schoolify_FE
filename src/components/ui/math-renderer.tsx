'use client';

import * as React from 'react';
import katex from 'katex';
import { cn } from '@/lib/utils';

const SUPERSCRIPTS: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  'ⁿ': 'n', '⁺': '+', '⁻': '-', 'ᵃ': 'a', 'ᵇ': 'b',
  'ˣ': 'x', 'ʸ': 'y', 'ᵏ': 'k', 'ᵐ': 'm',
};

const SUBSCRIPTS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  'ₙ': 'n', 'ᵢ': 'i', 'ⱼ': 'j', 'ₖ': 'k', 'ₘ': 'm',
};

/**
 * Chuẩn hóa các cú pháp thân thiện, dễ gõ/dễ chỉnh sửa thành mã lệnh LaTeX chuẩn.
 * Ví dụ:
 *  - Unicode superscripts/subscripts: x², x³, x⁴, xⁿ, x₁, x₂ => x^{2}, x^{3}, x^{4}, x^{n}, x_{1}, x_{2}
 *  - Lũy thừa: x^2, x^3, x^n, (x+1)^2, x^[N] => x^{2}, x^{3}, x^{n}, (x+1)^{2}
 *  - Chỉ số dưới: x_1, x_2, y_CD, x_[1] => x_{1}, x_{2}, y_{CD}
 *  - Căn thức: √(x), √[x], \sqrt{x}, sqrt(x), ∛(x) => \sqrt{x}, \sqrt[3]{x}
 *  - Phân số: (a)/(b), [a]/[b], \frac{a}{b}
 *  - So sánh: >=, <=, !=, +- => \ge, \le, \neq, \pm
 *  - Vectơ: F⃗, v⃗, a⃗, u⃗, AB⃗ => \vec{F}, \vec{v}, \vec{a}, \vec{u}, \vec{AB}
 */
export function normalizeMathExpression(raw: string): string {
  if (!raw) return '';

  let res = raw;

  // 1. Chuyển Unicode superscripts (x², x³, x⁴, xⁿ, v.v.) thành ^{...}
  res = res.replace(/([a-zA-Z0-9)\]]+)([⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻ᵃᵇˣʸᵏᵐ]+)/g, (_, base, sups) => {
    const converted = Array.from(sups).map((ch: any) => SUPERSCRIPTS[ch] || ch).join('');
    return `${base}^{${converted}}`;
  });

  // 2. Chuyển Unicode subscripts (x₁, x₂, xₙ, v.v.) thành _{...}
  res = res.replace(/([a-zA-Z0-9)\]]+)([₀₁₂₃₄₅₆₇₈₉ₙᵢⱼₖₘ]+)/g, (_, base, subs) => {
    const converted = Array.from(subs).map((ch: any) => SUBSCRIPTS[ch] || ch).join('');
    return `${base}_{${converted}}`;
  });

  // 3. Lũy thừa kiểu x^[N], x^[2], (x+1)^[2] => ^{...}
  res = res.replace(/\^\[([^\]]+)\]/g, '^{$1}');

  // 4. Lũy thừa tự nhiên: x^2, x^3, x^n, (x+1)^2, 10^18 nếu chưa bọc ngoặc nhọn
  res = res.replace(/([a-zA-Z0-9)\]]+)\^([a-zA-Z0-9+\-]+)(?![a-zA-Z0-9^{])/g, '$1^{$2}');

  // 5. Chỉ số dưới kiểu x_[1], v_[0] => _{...}
  res = res.replace(/_\[([^\]]+)\]/g, '_{$1}');

  // 6. Chỉ số dưới tự nhiên: x_1, x_2, y_CD, a_n nếu chưa bọc ngoặc nhọn
  res = res.replace(/([a-zA-Z0-9)\]]+)_([a-zA-Z0-9]+)(?![a-zA-Z0-9_{])/g, '$1_{$2}');

  // 7. Căn thức: √(x), √[x], ∛(x), ∛[x], sqrt(...)
  res = res.replace(/√\(([^)]+)\)/g, '\\sqrt{$1}');
  res = res.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
  res = res.replace(/\bsqrt\(([^)]+)\)/g, '\\sqrt{$1}');
  res = res.replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}');
  res = res.replace(/∛\[([^\]]+)\]/g, '\\sqrt[3]{$1}');

  // 8. Phân số dạng (a)/(b), [a]/[b]
  res = res.replace(
    /\(([a-zA-Z0-9+\-*^_{}\s\\]+)\)\s*\/\s*\(([a-zA-Z0-9+\-*^_{}\s\\]+)\)/g,
    '\\frac{$1}{$2}'
  );
  res = res.replace(
    /\[([a-zA-Z0-9+\-*^_{}\s\\]+)\]\s*\/\s*\[([a-zA-Z0-9+\-*^_{}\s\\]+)\]/g,
    '\\frac{$1}{$2}'
  );

  // 9. Tích phân có cận shorthand tự nhiên do học sinh gõ: 1\int3, 1 \int 3, a\int b, 1\int^3, v.v.
  res = res.replace(/([a-zA-Z0-9+\-]+)\s*\\?int\s*([a-zA-Z0-9+\-]+)/g, '\\int_{$1}^{$2}');

  // Tích phân dạng \int[a; b], \int[a, b], \int[a->b], \int[a→b], int[a; b]
  res = res.replace(/\\?int\s*\[\s*([^;,→\->\s]+)\s*(?:[;,]|->|→)\s*([^\]\s]+)\s*\]/g, '\\int_{$1}^{$2}');

  // Tích phân dạng \int_1^3 hoặc int_1^3 hoặc \int_{1}^{3} hoặc int_{1}^{3}
  res = res.replace(/\\?int_(\{?[^}^_\s]+\}?)\^(\{?[^}^_\s]+\}?)/g, (_, lower, upper) => {
    const l = lower.startsWith('{') ? lower : `{${lower}}`;
    const u = upper.startsWith('{') ? upper : `{${upper}}`;
    return `\\int_${l}^${u}`;
  });
  res = res.replace(/\\?int\^(\{?[^}^_\s]+\}?)\_(\{?[^}^_\s]+\}?)/g, (_, upper, lower) => {
    const l = lower.startsWith('{') ? lower : `{${lower}}`;
    const u = upper.startsWith('{') ? upper : `{${upper}}`;
    return `\\int_${l}^${u}`;
  });

  // Tích phân chỉ có cận dưới: \int_1, int_1
  res = res.replace(/\\?int_(\{?[^}^_\s]+\}?)(?!\^)/g, (_, lower) => {
    const l = lower.startsWith('{') ? lower : `{${lower}}`;
    return `\\int_${l}`;
  });

  // Ký hiệu nguyên hàm đơn lẻ: \int hoặc int f(x)
  res = res.replace(/(\bint\b)(?![a-zA-Z{_^])/g, '\\int ');

  // 10. Giới hạn lim:
  // lim(x->a), lim(x -> a), lim(x→a), \lim(x->a)
  res = res.replace(/\\?lim\s*\(\s*([a-zA-Z0-9_]+)\s*(?:->|→|\\to)\s*([^)]+)\s*\)/g, (_, varName, target) => {
    let t = target.trim();
    if (t === '+inf' || t === 'inf' || t === '+oo' || t === 'oo') t = '+\\infty';
    else if (t === '-inf' || t === '-oo') t = '-\\infty';
    return `\\lim_{${varName} \\to ${t}}`;
  });

  // lim_{x->a} hoặc lim_{x→a}
  res = res.replace(/\\?lim_\{\s*([a-zA-Z0-9_]+)\s*(?:->|→)\s*([^}]+)\s*\}/g, (_, varName, target) => {
    let t = target.trim();
    if (t === '+inf' || t === 'inf' || t === '+oo' || t === 'oo') t = '+\\infty';
    else if (t === '-inf' || t === '-oo') t = '-\\infty';
    return `\\lim_{${varName} \\to ${t}}`;
  });

  // lim x->a
  res = res.replace(/\\?lim\s+([a-zA-Z0-9_]+)\s*(?:->|→|\\to)\s*([a-zA-Z0-9+\-∞\\_]+)/g, (_, varName, target) => {
    let t = target.trim();
    if (t === '+inf' || t === 'inf' || t === '+oo' || t === 'oo') t = '+\\infty';
    else if (t === '-inf' || t === '-oo') t = '-\\infty';
    return `\\lim_{${varName} \\to ${t}}`;
  });

  // \lim_{...} hoặc lim_{...} -> chuẩn hóa \lim_{...}
  res = res.replace(/(?:\\lim|\blim)_(?:\{([^}]+)\}|([a-zA-Z0-9+\-]+))/g, (_, p1, p2) => {
    let inner = (p1 || p2).trim();
    inner = inner.replace(/->|→/g, '\\to ');
    return `\\lim_{${inner}}`;
  });

  // 11. Vectơ: F⃗, v⃗, a⃗, u⃗, AB⃗
  res = res.replace(/([A-Za-z]{1,2})⃗/g, '\\vec{$1}');

  // 12. Ký hiệu so sánh & toán phổ thông
  res = res.replace(/>=/g, '\\ge ');
  res = res.replace(/<=/g, '\\le ');
  res = res.replace(/!=/g, '\\neq ');
  res = res.replace(/\+-/g, '\\pm ');
  res = res.replace(/Ω/g, '\\Omega ');
  res = res.replace(/Δ/g, '\\Delta ');
  res = res.replace(/π/g, '\\pi ');
  res = res.replace(/λ/g, '\\lambda ');
  res = res.replace(/ω/g, '\\omega ');
  res = res.replace(/μ/g, '\\mu ');
  res = res.replace(/ρ/g, '\\rho ');
  res = res.replace(/°/g, '^\\circ ');
  res = res.replace(/±/g, '\\pm ');
  res = res.replace(/≠/g, '\\neq ');
  res = res.replace(/≤/g, '\\le ');
  res = res.replace(/≥/g, '\\ge ');
  res = res.replace(/≈/g, '\\approx ');
  res = res.replace(/∞/g, '\\infty ');

  return res;
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
 *  2. Chứa cú pháp toán độc lập như: x^2, x^3, x², x³, x^n, x_1, √(x), (a)/(b), 1\int3, \int_{1}^{3}, lim(x->1), \vec{F}, \Omega, v.v.
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

  // Regex nhận diện công thức & ký hiệu toán học độc lập trong văn bản thông thường (ngoài dấu $)
  // Ưu tiên:
  // 1. Tích phân có cận hoặc nguyên hàm: 1\int3, \int_{1}^{3}, \int_1^3, \int f(x) dx, \int[a;b]
  // 2. Giới hạn lim: \lim_{x \to 1}, lim(x->3), lim_{x->1}, lim x->1
  // 3. LaTeX commands có chỉ số/mũ/tham số: \frac{a}{b}, \sqrt[3]{x}, \vec{v}, \alpha
  // 4. Lũy thừa x^2, x^3, x^[n], x², x³, chỉ số x_1, x_[1], x₁, căn thức \sqrt{}, √(x), phân số (a)/(b)
  const standaloneShorthandRegex =
    /(?:[a-zA-Z0-9+\-]+\s*\\?int\s*[a-zA-Z0-9+\-]+(?:\s+[a-zA-Z0-9+\-*^_{}()\s\\]*?dx)?|\\?int(?:_\{?[^}]+\}?|\^\{?[^}]+\}?|_\{?[a-zA-Z0-9+\-]+\}?|\^\{?[a-zA-Z0-9+\-]+\}?)*(?:\s+[a-zA-Z0-9+\-*^_{}()\s\\]*?dx)?|\\?lim\s*\([^)]+\)|\\?lim_\{[^}]+\}|\\?lim\s+[a-zA-Z0-9_]+\s*(?:->|→|\\to)\s*[a-zA-Z0-9+\-∞\\_]+|(?:\\[a-zA-Z]+(?:_\{[^}]+\}|_[a-zA-Z0-9+\-]+)?(?:\^\{[^}]+\}|\^[a-zA-Z0-9+\-]+)?(?:\{[^}]*\})*)|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)\^(?:\{[^}]+\}|\[[^\]]+\]|[a-zA-Z0-9+\-]+)|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻ᵃᵇˣʸᵏᵐ]+|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)_(?:\{[^}]+\}|\[[^\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)[₀₁₂₃₄₅₆₇₈₉ₙᵢⱼₖₘ]+|√\([^)]+\)|√\[[^\]]+\]|\bsqrt\([^)]+\)|∛\([^)]+\)|∛\[[^\]]+\]|\([a-zA-Z0-9+\-*^_{}\s\\]+\)\s*\/\s*\([a-zA-Z0-9+\-*^_{}\s\\]+\)|\[[a-zA-Z0-9+\-*^_{}\s\\]+\]\s*\/\s*\[[a-zA-Z0-9+\-*^_{}\s\\]+\]|[A-Za-z]{1,2}⃗|\b\d+\s*Ω)/g;

  return parts
    .map((part) => {
      if (part.type === 'math-block') {
        return `<div class="my-2 overflow-x-auto py-1">${renderKatex(part.content, true)}</div>`;
      }
      if (part.type === 'math-inline') {
        return renderKatex(part.content, false);
      }

      // Xử lý plain text: render các ký hiệu viết tắt x^2, 1\int3, lim(x->1) thành KaTeX
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
