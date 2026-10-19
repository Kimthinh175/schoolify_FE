'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Eye, Code, HelpCircle } from 'lucide-react';
import { MathRenderer } from '@/components/ui/math-renderer';

interface MathFormulaToolbarProps {
  onInsert: (snippet: string) => void;
  previewContent?: string;
  label?: string;
  defaultShowPreview?: boolean;
}

export function MathFormulaToolbar({
  onInsert,
  previewContent,
  label = 'Ký tự Toán:',
  defaultShowPreview = true,
}: MathFormulaToolbarProps) {
  const [showPreview, setShowPreview] = React.useState(defaultShowPreview);

  const mathSnippets = [
    { label: 'a/b', snippet: '\\frac{a}{b}', title: 'Phân số (a: tử số, b: mẫu số)' },
    { label: '√x', snippet: '\\sqrt{x}', title: 'Căn bậc hai' },
    { label: 'xⁿ', snippet: 'x^{2}', title: 'Số mũ / Lũy thừa' },
    { label: 'xₙ', snippet: 'x_{1}', title: 'Chỉ số dưới' },
    { label: '∫dx', snippet: '\\int_{a}^{b} f(x)dx', title: 'Tích phân xác định' },
    { label: '±', snippet: '\\pm ', title: 'Cộng trừ' },
    { label: '≤', snippet: '\\le ', title: 'Nhỏ hơn hoặc bằng' },
    { label: '≥', snippet: '\\ge ', title: 'Lớn hơn hoặc bằng' },
    { label: '≠', snippet: '\\ne ', title: 'Khác' },
    { label: '≈', snippet: '\\approx ', title: 'Xấp xỉ' },
    { label: '∞', snippet: '\\infty ', title: 'Vô cực' },
    { label: 'π', snippet: '\\pi ', title: 'Số Pi' },
    { label: 'α', snippet: '\\alpha ', title: 'Alpha' },
    { label: 'β', snippet: '\\beta ', title: 'Beta' },
    { label: 'Δ', snippet: '\\Delta ', title: 'Delta' },
    { label: 'θ', snippet: '\\theta ', title: 'Theta' },
    { label: 'λ', snippet: '\\lambda ', title: 'Lambda' },
  ];

  return (
    <div className="space-y-2">
      {/* Thanh nút bấm chèn ký tự */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase px-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            {label}
          </span>
          {mathSnippets.map((item) => (
            <button
              key={item.label}
              type="button"
              title={item.title}
              onClick={() => onInsert(`$${item.snippet}$`)}
              className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-white dark:bg-slate-900 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs transition-all active:scale-95"
            >
              {item.label}
            </button>
          ))}
        </div>

        {previewContent !== undefined && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowPreview(!showPreview)}
            className="h-7 px-2 text-[11px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white gap-1 shrink-0 font-medium"
          >
            {showPreview ? <Code className="w-3 h-3 text-slate-500 dark:text-slate-400" /> : <Eye className="w-3 h-3 text-primary" />}
            {showPreview ? 'Ẩn xem trước' : 'Xem trước (Live)'}
          </Button>
        )}
      </div>

      {/* Khung hiển thị thực tế (Live Render) cho người dùng/học sinh */}
      {showPreview && previewContent && previewContent.trim().length > 0 && (
        <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1.5 mb-2">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Hiển thị thực tế (Học sinh sẽ nhìn thấy):
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
              Công thức tự động render chuẩn KaTeX
            </span>
          </div>

          <MathRenderer content={previewContent} className="text-slate-900 dark:text-slate-100 font-sans" />
        </div>
      )}
    </div>
  );
}
