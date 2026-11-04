'use client';

import * as React from 'react';
import katex from 'katex';
import { Copy, Check, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeMathExpression, renderKatex } from '@/components/ui/math-renderer';

interface AgentChatMessageContentProps {
  content: string;
  role: 'user' | 'assistant';
  className?: string;
}

interface CodeBlockData {
  id: string;
  lang: string;
  code: string;
}

interface MathBlockData {
  id: string;
  latex: string;
}

/**
 * Component hiển thị khối mã lập trình với thanh header & nút Copy tiện lợi
 */
function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="my-2.5 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 text-[11px] shadow-sm">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800/80">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
          <Terminal className="w-3 h-3 text-[#00B8DD]" />
          <span className="uppercase font-semibold tracking-wider">{lang || 'CODE'}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px]"
          title="Sao chép mã"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Đã chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Chép mã</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto font-mono text-[11px] leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * Component hiển thị khối công thức toán KaTeX độc lập (Display Mode)
 */
function MathDisplayBlock({ latex, isUser }: { latex: string; isUser: boolean }) {
  const html = React.useMemo(() => {
    try {
      const normalized = normalizeMathExpression(latex.trim());
      return katex.renderToString(normalized, {
        displayMode: true,
        throwOnError: false,
        output: 'htmlAndMathml',
        strict: false,
      });
    } catch {
      return latex;
    }
  }, [latex]);

  return (
    <div
      className={cn(
        'my-2 max-w-full overflow-x-auto py-2 px-3 rounded-xl text-center select-text',
        isUser
          ? 'bg-white/10 border border-white/20 [&_.katex]:text-white [&_.katex-html]:text-white'
          : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 shadow-2xs'
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Regex nhận diện công thức & ký hiệu toán học độc lập trong văn bản thông thường (ngoài dấu $)
 */
const STANDALONE_SHORTHAND_REGEX =
  /(?:[a-zA-Z0-9+\-]+\s*\\?int\s*[a-zA-Z0-9+\-]+(?:\s+[a-zA-Z0-9+\-*^_{}()\s\\]*?dx)?|\\?int(?:_\{?[^}]+\}?|\^\{?[^}]+\}?|_\{?[a-zA-Z0-9+\-]+\}?|\^\{?[a-zA-Z0-9+\-]+\}?)*(?:\s+[a-zA-Z0-9+\-*^_{}()\s\\]*?dx)?|\\?lim\s*\([^)]+\)|\\?lim_\{[^}]+\}|\\?lim\s+[a-zA-Z0-9_]+\s*(?:->|→|\\to)\s*[a-zA-Z0-9+\-∞\\_]+|(?:\\[a-zA-Z]+(?:_\{[^}]+\}|_[a-zA-Z0-9+\-]+)?(?:\^\{[^}]+\}|\^[a-zA-Z0-9+\-]+)?(?:\{[^}]*\})*)|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)\^(?:\{[^}]+\}|\[[^\]]+\]|[a-zA-Z0-9+\-]+)|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ⁺⁻ᵃᵇˣʸᵏᵐ]+|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)_(?:\{[^}]+\}|\[[^\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)|(?:(?:\([^()]+\)|\[[^[\]]+\]|[a-zA-Z0-9α-ωΑ-Ω_]+)\s*)[₀₁₂₃₄₅₆₇₈₉ₙᵢⱼₖₘ]+|√\([^)]+\)|√\[[^\]]+\]|\bsqrt\([^)]+\)|∛\([^)]+\)|∛\[[^\]]+\]|\([a-zA-Z0-9+\-*^_{}\s\\]+\)\s*\/\s*\([a-zA-Z0-9+\-*^_{}\s\\]+\)|\[[a-zA-Z0-9+\-*^_{}\s\\]+\]\s*\/\s*\[[a-zA-Z0-9+\-*^_{}\s\\]+\]|[A-Za-z]{1,2}⃗|\b\d+\s*Ω)/g;

/**
 * Phân tích và render một dòng text đơn lẻ chứa hỗn hợp:
 * - Inline KaTeX: $...$ hoặc \(...\)
 * - Markdown inline: **bold**, *italic*, `code`
 * - Shorthand math: x^2, x_1, v.v.
 */
function renderInlineContent(rawText: string, isUser: boolean): React.ReactNode[] {
  if (!rawText) return [];

  // Chuẩn hóa inline math \( ... \) -> $ ... $
  const normalizedText = rawText.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // Phân tách bởi inline math delimiter $...$
  const mathRegex = /\$([^\$\n]+?)\$/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  const renderTextSegment = (textChunk: string) => {
    if (!textChunk) return;

    // Phân tách inline code `code`
    const codeRegex = /`([^`\n]+)`/g;
    let codeLastIdx = 0;
    let codeMatch: RegExpExecArray | null;

    while ((codeMatch = codeRegex.exec(textChunk)) !== null) {
      if (codeMatch.index > codeLastIdx) {
        parseMarkdownAndShorthand(textChunk.substring(codeLastIdx, codeMatch.index));
      }
      elements.push(
        <code
          key={`code-${keyIdx++}`}
          className={cn(
            'px-1.5 py-0.5 rounded text-[11px] font-mono mx-0.5',
            isUser
              ? 'bg-white/20 text-white border border-white/20'
              : 'bg-slate-100 dark:bg-slate-800 text-[#007D99] dark:text-[#00B8DD] border border-slate-200/60 dark:border-slate-700/60'
          )}
        >
          {codeMatch[1]}
        </code>
      );
      codeLastIdx = codeRegex.lastIndex;
    }

    if (codeLastIdx < textChunk.length) {
      parseMarkdownAndShorthand(textChunk.substring(codeLastIdx));
    }
  };

  const parseMarkdownAndShorthand = (str: string) => {
    if (!str) return;

    // Phân tách bold **text** hoặc __text__
    const boldRegex = /(\*\*|__)(.*?)\1/g;
    let boldLastIdx = 0;
    let boldMatch: RegExpExecArray | null;

    while ((boldMatch = boldRegex.exec(str)) !== null) {
      if (boldMatch.index > boldLastIdx) {
        parseItalicAndShorthand(str.substring(boldLastIdx, boldMatch.index));
      }
      elements.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold">
          {boldMatch[2]}
        </strong>
      );
      boldLastIdx = boldRegex.lastIndex;
    }

    if (boldLastIdx < str.length) {
      parseItalicAndShorthand(str.substring(boldLastIdx));
    }
  };

  const parseItalicAndShorthand = (str: string) => {
    if (!str) return;

    // Phân tách italic *text* hoặc _text_
    const italicRegex = /(\*|_)(.*?)\1/g;
    let italicLastIdx = 0;
    let italicMatch: RegExpExecArray | null;

    while ((italicMatch = italicRegex.exec(str)) !== null) {
      if (italicMatch.index > italicLastIdx) {
        parseShorthandMath(str.substring(italicLastIdx, italicMatch.index));
      }
      elements.push(
        <em key={`italic-${keyIdx++}`} className="italic">
          {italicMatch[2]}
        </em>
      );
      italicLastIdx = italicRegex.lastIndex;
    }

    if (italicLastIdx < str.length) {
      parseShorthandMath(str.substring(italicLastIdx));
    }
  };

  const parseShorthandMath = (plainText: string) => {
    if (!plainText) return;

    // Kiểm tra xem có chứa shorthand toán học như x^2, x_1, √(x), phân số không
    let lastMIdx = 0;
    let mMatch: RegExpExecArray | null;
    STANDALONE_SHORTHAND_REGEX.lastIndex = 0;

    let hasMatched = false;
    while ((mMatch = STANDALONE_SHORTHAND_REGEX.exec(plainText)) !== null) {
      hasMatched = true;
      if (mMatch.index > lastMIdx) {
        elements.push(plainText.substring(lastMIdx, mMatch.index));
      }
      const rawMath = mMatch[0];
      const html = renderKatex(rawMath, false);
      elements.push(
        <span
          key={`shortmath-${keyIdx++}`}
          className={cn(
            'inline-math mx-0.5',
            isUser && '[&_.katex]:text-white [&_.katex-html]:text-white'
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
      lastMIdx = STANDALONE_SHORTHAND_REGEX.lastIndex;
    }

    if (hasMatched) {
      if (lastMIdx < plainText.length) {
        elements.push(plainText.substring(lastMIdx));
      }
    } else {
      elements.push(plainText);
    }
  };

  while ((match = mathRegex.exec(normalizedText)) !== null) {
    if (match.index > lastIndex) {
      renderTextSegment(normalizedText.substring(lastIndex, match.index));
    }
    const mathContent = match[1];
    const html = renderKatex(mathContent, false);
    elements.push(
      <span
        key={`inline-math-${keyIdx++}`}
        className={cn(
          'inline-math mx-0.5 font-normal',
          isUser && '[&_.katex]:text-white [&_.katex-html]:text-white'
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
    lastIndex = mathRegex.lastIndex;
  }

  if (lastIndex < normalizedText.length) {
    renderTextSegment(normalizedText.substring(lastIndex));
  }

  return elements;
}

/**
 * Component hiển thị thông minh nội dung tin nhắn Chat AI & Người dùng:
 * - Chuẩn hóa và parse mọi định dạng toán KaTeX: $...$, $$...$$, \[...\], \(...\), \begin{cases}
 * - Parse Markdown: Bold, Italic, Headings, Lists, Quotes, Code Blocks với nút copy
 * - Responsive Mobile First & Zero Horizontal Scroll
 */
export const AgentChatMessageContent: React.FC<AgentChatMessageContentProps> = React.memo(
  ({ content, role, className }) => {
    const isUser = role === 'user';

    const renderedBlocks = React.useMemo(() => {
      if (!content) return null;

      // 1. Trích xuất Code Blocks: ```lang ... ```
      const codeBlocks: CodeBlockData[] = [];
      let textWithoutCode = content.replace(
        /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g,
        (_, lang, code) => {
          const id = `%%CODE_BLOCK_${codeBlocks.length}%%`;
          codeBlocks.push({ id, lang: (lang || '').trim(), code: code.trim() });
          return `\n\n${id}\n\n`;
        }
      );

      // 2. Chuẩn hóa Display Math: \[ ... \] -> $$ ... $$
      textWithoutCode = textWithoutCode.replace(/\\\[([\s\S]*?)\\\]/g, '\n\n$$$$$1$$$$\n\n');

      // Chuẩn hóa các môi trường toán độc lập nếu chưa bọc $
      textWithoutCode = textWithoutCode.replace(
        /(?<!\$)(?:\\begin\{(cases|aligned|matrix|pmatrix|bmatrix|vmatrix|gather|align)\*?\}[\s\S]*?\\end\{\1\*?\})(?!\$)/g,
        '\n\n$$$$ $& $$$$\n\n'
      );

      // 3. Trích xuất Math Display Blocks: $$ ... $$
      const mathBlocks: MathBlockData[] = [];
      const textWithoutMath = textWithoutCode.replace(/\$\$([\s\S]*?)\$\$/g, (_, latex) => {
        const id = `%%MATH_BLOCK_${mathBlocks.length}%%`;
        mathBlocks.push({ id, latex: latex.trim() });
        return `\n\n${id}\n\n`;
      });

      // 4. Tách các đoạn theo double newline (\n\n)
      const rawParagraphs = textWithoutMath
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);

      let blockKey = 0;

      return rawParagraphs.map((para) => {
        // Kiểm tra xem đoạn này có phải là Code Block không
        if (para.startsWith('%%CODE_BLOCK_') && para.endsWith('%%')) {
          const codeItem = codeBlocks.find((c) => c.id === para);
          if (codeItem) {
            return <CodeBlock key={`cb-${blockKey++}`} lang={codeItem.lang} code={codeItem.code} />;
          }
        }

        // Kiểm tra xem đoạn này có phải là Display Math Block không
        if (para.startsWith('%%MATH_BLOCK_') && para.endsWith('%%')) {
          const mathItem = mathBlocks.find((m) => m.id === para);
          if (mathItem) {
            return (
              <MathDisplayBlock
                key={`mb-${blockKey++}`}
                latex={mathItem.latex}
                isUser={isUser}
              />
            );
          }
        }

        // Kiểm tra Headings: ###, ##, #
        if (para.startsWith('### ')) {
          return (
            <h4
              key={`h4-${blockKey++}`}
              className={cn(
                'text-xs font-bold mt-2.5 mb-1 flex items-center gap-1.5',
                isUser ? 'text-white' : 'text-[#007D99] dark:text-[#00B8DD]'
              )}
            >
              {renderInlineContent(para.slice(4).trim(), isUser)}
            </h4>
          );
        }
        if (para.startsWith('## ')) {
          return (
            <h3
              key={`h3-${blockKey++}`}
              className={cn(
                'text-xs font-black mt-3 mb-1 flex items-center gap-1.5',
                isUser ? 'text-white' : 'text-slate-900 dark:text-slate-100'
              )}
            >
              {renderInlineContent(para.slice(3).trim(), isUser)}
            </h3>
          );
        }
        if (para.startsWith('# ')) {
          return (
            <h2
              key={`h2-${blockKey++}`}
              className={cn(
                'text-sm font-black mt-3 mb-1',
                isUser ? 'text-white' : 'text-slate-900 dark:text-slate-100'
              )}
            >
              {renderInlineContent(para.slice(2).trim(), isUser)}
            </h2>
          );
        }

        // Kiểm tra Blockquote: > ...
        if (para.startsWith('> ')) {
          const quoteLines = para
            .split('\n')
            .map((l) => l.replace(/^>\s*/, ''))
            .join(' ');
          return (
            <blockquote
              key={`quote-${blockKey++}`}
              className={cn(
                'my-2 pl-3 py-1 border-l-2 text-[11px] rounded-r-lg italic',
                isUser
                  ? 'border-white/60 bg-white/10 text-white'
                  : 'border-[#00B8DD] bg-[#00B8DD]/5 text-slate-700 dark:text-slate-300'
              )}
            >
              {renderInlineContent(quoteLines, isUser)}
            </blockquote>
          );
        }

        // Kiểm tra danh sách đánh số: 1. , 2. ...
        const lines = para.split('\n');
        const isOrderedList = lines.every((l) => /^\d+\.\s+/.test(l.trim()));
        if (isOrderedList && lines.length > 0) {
          return (
            <ol key={`ol-${blockKey++}`} className="my-1.5 space-y-1 pl-4 list-decimal text-xs">
              {lines.map((line, lIdx) => {
                const itemContent = line.replace(/^\d+\.\s+/, '').trim();
                return (
                  <li key={`li-${lIdx}`} className="leading-relaxed pl-0.5">
                    {renderInlineContent(itemContent, isUser)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Kiểm tra danh sách gạch đầu dòng: - hoặc *
        const isUnorderedList = lines.every((l) => /^[-*•]\s+/.test(l.trim()));
        if (isUnorderedList && lines.length > 0) {
          return (
            <ul key={`ul-${blockKey++}`} className="my-1.5 space-y-1 pl-4 list-disc text-xs">
              {lines.map((line, lIdx) => {
                const itemContent = line.replace(/^[-*•]\s+/, '').trim();
                return (
                  <li key={`li-${lIdx}`} className="leading-relaxed pl-0.5">
                    {renderInlineContent(itemContent, isUser)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Đoạn văn thông thường (hỗ trợ xuống dòng mềm bên trong đoạn)
        return (
          <div key={`p-${blockKey++}`} className="leading-relaxed my-1">
            {lines.map((line, lIdx) => (
              <React.Fragment key={`line-${lIdx}`}>
                {renderInlineContent(line, isUser)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        );
      });
    }, [content, isUser]);

    return (
      <div
        className={cn(
          'agent-chat-content break-words text-xs leading-relaxed max-w-full',
          isUser && '[&_.katex]:text-white [&_.katex-html]:text-white',
          className
        )}
      >
        {renderedBlocks}
      </div>
    );
  }
);

AgentChatMessageContent.displayName = 'AgentChatMessageContent';
