'use client';

import * as React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string | null;
  className?: string;
  inline?: boolean;
}

export function MathRenderer({ content, className = '', inline = false }: MathRendererProps) {
  if (!content) return null;

  // Tách văn bản thành các token: văn bản thuần túy và biểu thức KaTeX ($...$ hoặc $$...$$)
  const tokens = React.useMemo(() => {
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    const parts = content.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
        const math = part.slice(2, -2).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
          });
          return { type: 'block-math', html, key: index };
        } catch {
          return { type: 'text', text: part, key: index };
        }
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1).trim();
        try {
          const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
          });
          return { type: 'inline-math', html, key: index };
        } catch {
          return { type: 'text', text: part, key: index };
        }
      } else {
        return { type: 'text', text: part, key: index };
      }
    });
  }, [content]);

  if (inline) {
    return (
      <span className={className}>
        {tokens.map((token) =>
          token.type === 'inline-math' || token.type === 'block-math' ? (
            <span
              key={token.key}
              dangerouslySetInnerHTML={{ __html: token.html || '' }}
              className="inline-block px-0.5 align-middle"
            />
          ) : (
            <span key={token.key}>{token.text}</span>
          )
        )}
      </span>
    );
  }

  return (
    <div className={`leading-relaxed ${className}`}>
      {tokens.map((token) =>
        token.type === 'block-math' ? (
          <div
            key={token.key}
            dangerouslySetInnerHTML={{ __html: token.html || '' }}
            className="my-2 overflow-x-auto text-center"
          />
        ) : token.type === 'inline-math' ? (
          <span
            key={token.key}
            dangerouslySetInnerHTML={{ __html: token.html || '' }}
            className="inline-block px-0.5 align-middle"
          />
        ) : (
          <span key={token.key}>{token.text}</span>
        )
      )}
    </div>
  );
}
