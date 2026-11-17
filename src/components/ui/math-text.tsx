'use client';

import * as React from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

/** Utility helper to strip redundant option labels like "A. ", "B. ", "a) ", "A/ " from answer content */
export function cleanOptionText(text: string): string {
  if (!text) return '';
  // Strip option prefix A., B., C., D. followed by dot/colon/paren and space
  return text.replace(/^(?:\*|\[x\]\s*)?[A-Ea-e][\.\:\)\/\-]\s+(?=\$|[a-zA-Z0-9\\\,\-\+\(\[\{])/, '').trim();
}

/**
 * Component hiển thị văn bản học tập kèm công thức toán LaTeX ($...$), hình ảnh Markdown & Bảng biểu (.docx Table)
 */
export function MathText({ text, className = '' }: MathTextProps) {
  if (!text) return null;

  // Render Markdown Table nếu văn bản chứa bảng | ... |
  if (text.includes('|') && text.split('\n').some((l) => l.trim().startsWith('|') && l.trim().includes('|'))) {
    const lines = text.split('\n');
    const tableLines: string[] = [];
    const otherLinesBefore: string[] = [];
    const otherLinesAfter: string[] = [];
    let inTable = false;
    let finishedTable = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.includes('|')) {
        inTable = true;
        tableLines.push(line);
      } else {
        if (inTable) finishedTable = true;
        if (finishedTable) otherLinesAfter.push(line);
        else otherLinesBefore.push(line);
      }
    }

    if (tableLines.length > 0) {
      return (
        <span className={`inline font-sans ${className}`}>
          {otherLinesBefore.length > 0 && <MathText text={otherLinesBefore.join('\n')} className={className} />}
          <RenderMarkdownTable text={tableLines.join('\n')} />
          {otherLinesAfter.length > 0 && <MathText text={otherLinesAfter.join('\n')} className={className} />}
        </span>
      );
    }
  }

  // Xử lý xuống dòng \n để các dòng gạch đầu dòng (•) hoặc đoạn văn xuống hàng chuẩn xác
  if (text.includes('\n')) {
    const lines = text.split('\n');
    return (
      <span className={`inline font-sans ${className}`}>
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            <MathTextLine text={line} className={className} />
          </React.Fragment>
        ))}
      </span>
    );
  }

  return <MathTextLine text={text} className={className} />;
}

function MathTextLine({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  // Split by Markdown images: ![alt](url)
  const imgRegex = /(!\[[^\]]*\]\([^)]+\))/g;
  const parts = text.split(imgRegex);

  return (
    <span className={`inline font-sans ${className}`}>
      {parts.map((part, idx) => {
        const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          const alt = imgMatch[1] || 'Hình minh họa';
          const src = imgMatch[2];
          return (
            <span key={idx} className="block my-2 text-center">
              <img
                src={src}
                alt={alt}
                className="max-h-80 max-w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md object-contain bg-white dark:bg-slate-950 p-1 mx-auto my-1 inline-block"
              />
            </span>
          );
        }
        return <RenderInlineMath key={idx} text={part} className={className} />;
      })}
    </span>
  );
}

function RenderMarkdownTable({ text }: { text: string }) {
  const lines = text.split('\n').filter((l) => l.trim().includes('|'));
  if (lines.length === 0) return null;

  const rows = lines.map((line) => {
    const rawCells = line.split('|');
    if (rawCells.length > 2 && rawCells[0].trim() === '' && rawCells[rawCells.length - 1].trim() === '') {
      return rawCells.slice(1, -1).map((c) => c.trim());
    }
    return rawCells.map((c) => c.trim()).filter(Boolean);
  });

  if (rows.length === 0) return null;

  const headerRow = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div className="overflow-x-auto my-3">
      <table className="min-w-fit border-collapse border border-indigo-200 dark:border-slate-800 text-xs font-sans rounded-xl overflow-hidden shadow-xs mx-auto">
        {headerRow && (
          <thead>
            <tr className="bg-indigo-50/80 dark:bg-slate-800 text-indigo-950 dark:text-indigo-200 font-bold border-b border-indigo-200 dark:border-slate-700">
              {headerRow.map((cell, cIdx) => (
                <th key={cIdx} className="px-4 py-2 border-r border-indigo-200 dark:border-slate-700 text-center last:border-r-0">
                  <RenderInlineMath text={cell} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, rIdx) => (
            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/60 dark:bg-slate-900/50'}>
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-2 border-t border-r border-slate-200 dark:border-slate-800 text-center last:border-r-0 text-slate-800 dark:text-slate-200 font-medium">
                  <RenderInlineMath text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RenderInlineMath({ text, className = '' }: { text: string; className?: string }) {
  if (!text) return null;

  // Auto-wrap bare LaTeX commands in natural language text if missing $
  const normalizedText = autoWrapLatexCommands(text);

  const parts = normalizedText.split(/(\$[^$]+\$)/g);

  return (
    <span className={`inline font-sans ${className}`}>
      {parts.map((part, idx) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const latex = part.slice(1, -1).trim();
          return <RenderMathLatex key={idx} latex={latex} />;
        }
        // If part is pure math without dollar (e.g. from expressionLatex)
        if (!part.includes('$') && (part.startsWith('\\') || (part.includes('\\') && !/[a-zA-ZÀ-ỹ]{4,}\s+[a-zA-ZÀ-ỹ]{3,}/.test(part)))) {
          return <RenderMathLatex key={idx} latex={part} />;
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

function autoWrapLatexCommands(input: string): string {
  if (!input || input.includes('$')) return input;
  // If text contains Vietnamese keywords and backslash commands, wrap the math parts
  if (/\b(?:cho|của|với|khi|được|và|hoặc|ta|thì|nếu|áp\s+dụng|chia|tính|tìm|hàm|thỏa\s+mãn|tương\s+ứng|nghiệm)\b/i.test(input)) {
    return input.replace(/(\\(?:sqrt|frac|sin|cos|tan|cot|begin|alpha|beta|theta|pi|mathbb|omega|varphi)[^{}\s]*(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})*)/g, '$$$1$$');
  }
  return input;
}

/** Find balanced pair of braces { ... } starting at index */
function findBalanced(str: string, openIndex: number): { start: number; end: number; content: string } | null {
  if (openIndex === -1 || openIndex >= str.length || str[openIndex] !== '{') return null;
  let depth = 1;
  for (let i = openIndex + 1; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return { start: openIndex, end: i, content: str.substring(openIndex + 1, i) };
      }
    }
  }
  return null;
}

/** Recursive React AST renderer for LaTeX math expressions */
function renderMathAst(latex: string, keyPrefix = 'm'): React.ReactNode[] {
  if (!latex) return [];

  const nodes: React.ReactNode[] = [];
  let remaining = latex.trim();
  let subIdx = 0;

  while (remaining.length > 0) {
    const k = `${keyPrefix}-${subIdx++}`;

    // 1. \begin{cases} ... \end{cases}
    const casesMatch = remaining.match(/^\\begin\{cases\}([\s\S]*?)\\end\{cases\}/);
    if (casesMatch) {
      const inner = casesMatch[1];
      const lines = inner
        .split('\\\\')
        .map((l) => l.trim())
        .filter(Boolean);
      nodes.push(
        <span key={k} className="inline-flex items-center align-middle mx-1.5 my-1">
          <span className="text-2xl sm:text-3xl font-light font-serif leading-none select-none text-indigo-600 dark:text-indigo-400 mr-1.5">
            {`{`}
          </span>
          <span className="inline-flex flex-col gap-1 text-xs sm:text-sm font-medium">
            {lines.map((line, lIdx) => (
              <span key={lIdx} className="inline-flex items-center">
                {renderMathAst(line, `${k}-c${lIdx}`)}
              </span>
            ))}
          </span>
        </span>
      );
      remaining = remaining.substring(casesMatch[0].length);
      continue;
    }

    // 2. \frac{num}{den}
    if (remaining.startsWith('\\frac')) {
      const firstBrace = remaining.indexOf('{', 5);
      const numMatch = findBalanced(remaining, firstBrace);
      if (numMatch) {
        const secondBrace = remaining.indexOf('{', numMatch.end + 1);
        const denMatch = findBalanced(remaining, secondBrace);
        if (denMatch) {
          nodes.push(
            <span key={k} className="inline-flex flex-col items-center justify-center align-middle mx-1 font-sans text-[0.88em] leading-none">
              <span className="border-b border-slate-700 dark:border-slate-300 px-1 pb-0.5 text-center leading-tight font-medium inline-block text-slate-900 dark:text-slate-100">
                {renderMathAst(numMatch.content, `${k}-n`)}
              </span>
              <span className="px-1 pt-0.5 text-center leading-tight font-medium inline-block text-slate-900 dark:text-slate-100">
                {renderMathAst(denMatch.content, `${k}-d`)}
              </span>
            </span>
          );
          remaining = remaining.substring(denMatch.end + 1);
          continue;
        }
      }
    }

    // 3. \sqrt{content}
    if (remaining.startsWith('\\sqrt')) {
      const openBrace = remaining.indexOf('{', 5);
      const sqrtMatch = findBalanced(remaining, openBrace);
      if (sqrtMatch) {
        nodes.push(
          <span key={k} className="inline-flex items-center align-middle mx-1 text-slate-900 dark:text-slate-100">
            <span className="text-[1.2em] font-serif leading-none select-none -mr-[2px]">√</span>
            <span className="border-t border-slate-700 dark:border-slate-300 pt-0.5 px-1 inline-flex items-center">
              {renderMathAst(sqrtMatch.content, `${k}-sq`)}
            </span>
          </span>
        );
        remaining = remaining.substring(sqrtMatch.end + 1);
        continue;
      }
    }

    // 4. \left( ... \right) tall parentheses
    if (remaining.startsWith('\\left(')) {
      const rightIdx = remaining.indexOf('\\right)');
      if (rightIdx !== -1) {
        const inner = remaining.substring(6, rightIdx);
        nodes.push(
          <span key={k} className="inline-flex items-center align-middle text-slate-900 dark:text-slate-100">
            <span className="text-xl sm:text-2xl font-light select-none text-slate-500 dark:text-slate-400 mx-0.5 leading-none">(</span>
            <span className="inline-flex items-center">{renderMathAst(inner, `${k}-pr`)}</span>
            <span className="text-xl sm:text-2xl font-light select-none text-slate-500 dark:text-slate-400 mx-0.5 leading-none">)</span>
          </span>
        );
        remaining = remaining.substring(rightIdx + 7);
        continue;
      }
    }

    // 5. Look for the next macro delimiter or stop token
    const nextSpecial = remaining.search(/(\\begin\{cases\}|\\frac|\\sqrt|\\left\()/);
    let chunk = remaining;
    if (nextSpecial > 0) {
      chunk = remaining.substring(0, nextSpecial);
      remaining = remaining.substring(nextSpecial);
    } else if (nextSpecial === 0) {
      // Unmatched macro fallback, take 1 character
      chunk = remaining[0];
      remaining = remaining.substring(1);
    } else {
      remaining = '';
    }

    // Format inline symbols & typography inside this chunk
    nodes.push(
      <span
        key={k}
        dangerouslySetInnerHTML={{ __html: formatInlineSymbols(chunk) }}
        className="font-serif text-slate-900 dark:text-slate-100 mx-0.5 text-[0.98em]"
      />
    );
  }

  return nodes;
}

function formatInlineSymbols(raw: string): string {
  if (!raw) return '';

  return raw
    // Clean TeX delimiters
    .replace(/\\left\./g, '')
    .replace(/\\right\./g, '')
    .replace(/\\left\[/g, '[')
    .replace(/\\right\]/g, ']')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\text\{([^}]+)\}/g, '<span class="font-sans not-italic">$1</span>')
    .replace(/\\mathrm\{([^}]+)\}/g, '<span class="font-sans not-italic">$1</span>')
    // Math functions: keep upright (not italic)
    .replace(/\\tan/g, '<span class="font-sans font-semibold not-italic text-indigo-700 dark:text-indigo-300">tan</span>')
    .replace(/\\sin/g, '<span class="font-sans font-semibold not-italic text-indigo-700 dark:text-indigo-300">sin</span>')
    .replace(/\\cos/g, '<span class="font-sans font-semibold not-italic text-indigo-700 dark:text-indigo-300">cos</span>')
    .replace(/\\cot/g, '<span class="font-sans font-semibold not-italic text-indigo-700 dark:text-indigo-300">cot</span>')
    .replace(/\\lim/g, '<span class="font-sans font-semibold not-italic">lim</span>')
    .replace(/\\log/g, '<span class="font-sans font-semibold not-italic">log</span>')
    .replace(/\\ln/g, '<span class="font-sans font-semibold not-italic">ln</span>')
    .replace(/\\arcsin/g, '<span class="font-sans font-semibold not-italic">arcsin</span>')
    .replace(/\\arccos/g, '<span class="font-sans font-semibold not-italic">arccos</span>')
    .replace(/\\arctan/g, '<span class="font-sans font-semibold not-italic">arctan</span>')
    // Greek letters
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\phi/g, 'ϕ')
    .replace(/\\varphi/g, 'φ')
    // Blackboard sets
    .replace(/\\mathbb\{R\}/g, '<span class="font-sans font-bold">ℝ</span>')
    .replace(/\\mathbb\{Z\}/g, '<span class="font-sans font-bold">ℤ</span>')
    .replace(/\\mathbb\{N\}/g, '<span class="font-sans font-bold">ℕ</span>')
    .replace(/\\mathbb\{Q\}/g, '<span class="font-sans font-bold">ℚ</span>')
    // Degree & Specific symbols
    .replace(/\\degree/g, '°')
    .replace(/\^\\circ/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\\setminus/g, ' \\ ')
    .replace(/\\mid/g, ' | ')
    .replace(/\\times/g, ' × ')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\dots|\\ldots|\\cdots/g, '…')
    // Operators & Relations with balanced spacing
    .replace(/\\iff/g, ' <span class="font-sans text-indigo-600 dark:text-indigo-400 font-bold px-1">⟺</span> ')
    .replace(/\\implies/g, ' <span class="font-sans text-indigo-600 dark:text-indigo-400 font-bold px-1">⟹</span> ')
    .replace(/\\equiv/g, ' ≡ ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\le/g, ' ≤ ')
    .replace(/\\ge/g, ' ≥ ')
    .replace(/\\in/g, ' ∈ ')
    .replace(/\\notin/g, ' ∉ ')
    .replace(/\\infty/g, '∞')
    .replace(/\\rightarrow/g, ' → ')
    .replace(/\\to/g, ' → ')
    .replace(/\\quad/g, '&nbsp;&nbsp;')
    .replace(/\\qquad/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
    .replace(/\\ /g, '&nbsp;')
    .replace(/~/g, '&nbsp;')
    // Powers & Subscripts
    .replace(/([a-zA-Z0-9α-ωΑ-Ω\)\}\]])\^\{([^{}]+)\}/g, '$1<sup>$2</sup>')
    .replace(/([a-zA-Z0-9α-ωΑ-Ω\)\}\]])\^([a-zA-Z0-9\+\-]+)/g, '$1<sup>$2</sup>')
    .replace(/([a-zA-Z0-9α-ωΑ-Ω\)\}\]])\_\{([^{}]+)\}/g, '$1<sub>$2</sub>')
    .replace(/([a-zA-Z0-9α-ωΑ-Ω\)\}\]])\_([a-zA-Z0-9\+\-]+)/g, '$1<sub>$2</sub>')
    .replace(/\\int_\{([^{}]+)\}\^\{([^{}]+)\}/g, '∫<sub>$1</sub><sup>$2</sup>')
    .replace(/\\int/g, '∫');
}

function RenderMathLatex({ latex, className = '' }: { latex: string; className?: string }) {
  if (!latex) return null;
  return (
    <span className={`inline-flex items-center flex-wrap align-middle mx-0.5 ${className}`}>
      {renderMathAst(latex)}
    </span>
  );
}
