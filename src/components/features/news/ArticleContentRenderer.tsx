'use client';

import * as React from 'react';
import { MathText } from '@/components/ui/math-text';
import { extractTableOfContents } from '@/services/news.service';
import { NewsTocItem } from '@/types';

interface ArticleContentRendererProps {
  content: string;
  toc?: NewsTocItem[] | null;
}

/**
 * Render inline bold (**text**) và code (`code`) kết hợp công thức Toán LaTeX ($...$)
 */
function RichInlineText({ text }: { text: string }) {
  if (!text) return null;
  const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <>
      {segments.map((seg, idx) => {
        if (seg.startsWith('**') && seg.endsWith('**') && seg.length > 4) {
          return (
            <strong key={idx} className="font-bold text-slate-900 dark:text-white">
              <MathText text={seg.slice(2, -2)} />
            </strong>
          );
        }
        if (seg.startsWith('`') && seg.endsWith('`') && seg.length > 2) {
          return (
            <code
              key={idx}
              className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[#007D99] dark:text-[#00B8DD] font-mono text-xs"
            >
              {seg.slice(1, -1)}
            </code>
          );
        }
        return <MathText key={idx} text={seg} />;
      })}
    </>
  );
}

export function ArticleContentRenderer({ content, toc }: ArticleContentRendererProps) {
  const resolvedToc = React.useMemo(
    () => (toc && toc.length > 0 ? toc : extractTableOfContents(content)),
    [content, toc]
  );

  const blocks = React.useMemo(() => {
    if (!content) return [];
    const lines = content.split('\n');
    let headingCursor = 0;

    type Block =
      | { type: 'h2' | 'h3' | 'h4'; id: string; text: string }
      | { type: 'ul'; items: string[] }
      | { type: 'ol'; items: string[] }
      | { type: 'blockquote'; text: string }
      | { type: 'p'; text: string };

    const result: Block[] = [];
    let currentUl: string[] = [];
    let currentOl: string[] = [];

    const flushLists = () => {
      if (currentUl.length > 0) {
        result.push({ type: 'ul', items: [...currentUl] });
        currentUl = [];
      }
      if (currentOl.length > 0) {
        result.push({ type: 'ol', items: [...currentOl] });
        currentOl = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushLists();
        continue;
      }

      // Markdown Heading ##, ###, ####
      const mdHeading = line.match(/^(#{2,4})\s+(.+)$/);
      if (mdHeading) {
        flushLists();
        const level = mdHeading[1].length as 2 | 3 | 4;
        const text = mdHeading[2].replace(/[*_`~]/g, '').trim();
        const tocEntry = resolvedToc[headingCursor++];
        const id = tocEntry?.id || `muc-${headingCursor}`;
        result.push({
          type: level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4',
          id,
          text,
        });
        continue;
      }

      // Unordered list (- or *)
      const ulMatch = line.match(/^[-*•]\s+(.+)$/);
      if (ulMatch) {
        if (currentOl.length > 0) flushLists();
        currentUl.push(ulMatch[1]);
        continue;
      }

      // Ordered list (1. 2. ...)
      const olMatch = line.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        if (currentUl.length > 0) flushLists();
        currentOl.push(olMatch[1]);
        continue;
      }

      // Blockquote (> ...)
      if (line.startsWith('>')) {
        flushLists();
        result.push({ type: 'blockquote', text: line.replace(/^>\s*/, '') });
        continue;
      }

      flushLists();
      result.push({ type: 'p', text: line });
    }

    flushLists();
    return result;
  }, [content, resolvedToc]);

  return (
    <div className="space-y-5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={idx}
              id={block.id}
              className="scroll-mt-28 pt-5 pb-1 text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2.5"
            >
              <span className="w-1.5 h-6 rounded-full bg-[#00B8DD] shrink-0" />
              <span>
                <RichInlineText text={block.text} />
              </span>
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3
              key={idx}
              id={block.id}
              className="scroll-mt-28 pt-3 text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100"
            >
              <RichInlineText text={block.text} />
            </h3>
          );
        }

        if (block.type === 'h4') {
          return (
            <h4
              key={idx}
              id={block.id}
              className="scroll-mt-28 pt-2 text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200"
            >
              <RichInlineText text={block.text} />
            </h4>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul
              key={idx}
              className="space-y-2.5 pl-4 sm:pl-6 bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-800"
            >
              {block.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#00B8DD] mt-2 shrink-0" />
                  <span className="flex-1">
                    <RichInlineText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={idx} className="space-y-3 pl-1">
              {block.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1">
                    <RichInlineText text={item} />
                  </span>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={idx}
              className="border-l-4 border-[#00B8DD] bg-[#00B8DD]/5 dark:bg-[#00B8DD]/10 px-5 py-4 rounded-r-2xl italic text-slate-700 dark:text-slate-200"
            >
              <RichInlineText text={block.text} />
            </blockquote>
          );
        }

        return (
          <p key={idx} className="leading-7 sm:leading-8">
            <RichInlineText text={block.text} />
          </p>
        );
      })}
    </div>
  );
}

