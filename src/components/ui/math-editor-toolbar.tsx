'use client';

import * as React from 'react';
import { MathText } from '@/components/ui/math-text';
import { Calculator, Eye } from 'lucide-react';

interface MathEditorToolbarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  className?: string;
}

interface MathSymbolGroup {
  category: string;
  symbols: { label: string; latex: string; preview: string }[];
}

const MATH_SYMBOL_GROUPS: MathSymbolGroup[] = [
  {
    category: 'Cơ bản',
    symbols: [
      { label: 'Phân số', latex: '\\frac{a}{b}', preview: '$\\frac{a}{b}$' },
      { label: 'Số mũ', latex: 'x^{2}', preview: '$x^{2}$' },
      { label: 'Chỉ số', latex: 'x_{n}', preview: '$x_{n}$' },
      { label: 'Căn bậc hai', latex: '\\sqrt{x}', preview: '$\\sqrt{x}$' },
      { label: 'Cộng trừ', latex: '\\pm', preview: '$\\pm$' },
      { label: 'Nhân', latex: '\\cdot', preview: '$\\cdot$' },
    ],
  },
  {
    category: 'Quan hệ & Tập hợp',
    symbols: [
      { label: 'Khác', latex: '\\neq', preview: '$\\neq$' },
      { label: 'Nhỏ/Bằng', latex: '\\le', preview: '$\\le$' },
      { label: 'Lớn/Bằng', latex: '\\ge', preview: '$\\ge$' },
      { label: 'Thuộc', latex: '\\in', preview: '$\\in$' },
      { label: 'Tương đương', latex: '\\iff', preview: '$\\iff$' },
      { label: 'Suy ra', latex: '\\implies', preview: '$\\implies$' },
      { label: 'Tập số thực', latex: '\\mathbb{R}', preview: '$\\mathbb{R}$' },
      { label: 'Vô cùng', latex: '\\infty', preview: '$\\infty$' },
    ],
  },
  {
    category: 'Lượng giác & Ký hiệu Hy Lạp',
    symbols: [
      { label: 'Alpha', latex: '\\alpha', preview: '$\\alpha$' },
      { label: 'Beta', latex: '\\beta', preview: '$\\beta$' },
      { label: 'Theta', latex: '\\theta', preview: '$\\theta$' },
      { label: 'Pi', latex: '\\pi', preview: '$\\pi$' },
      { label: 'Sin', latex: '\\sin(\\alpha)', preview: '$\\sin(\\alpha)$' },
      { label: 'Cos', latex: '\\cos(\\alpha)', preview: '$\\cos(\\alpha)$' },
      { label: 'Tan', latex: '\\tan(\\alpha)', preview: '$\\tan(\\alpha)$' },
      { label: 'Cot', latex: '\\cot(\\alpha)', preview: '$\\cot(\\alpha)$' },
    ],
  },
];

export function MathEditorToolbar({
  value,
  onChange,
  placeholder = 'Nhập lời giải hoặc công thức toán của bạn...',
  rows = 4,
  label = 'Bộ công cụ Soạn thảo Toán học (Math Editor Assistant cho Học sinh):',
  className = '',
}: MathEditorToolbarProps) {
  const [activeCategory, setActiveCategory] = React.useState<string>('Cơ bản');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertLatex = (latex: string) => {
    if (!textareaRef.current) {
      onChange(value + ' $' + latex + '$ ');
      return;
    }
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const insertion = `$${latex}$`;
    const newValue = value.substring(0, start) + insertion + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      el.focus();
      const newPos = start + insertion.length;
      el.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const currentGroup = MATH_SYMBOL_GROUPS.find((g) => g.category === activeCategory) || MATH_SYMBOL_GROUPS[0];

  return (
    <div className={`space-y-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {label}
        </label>

      </div>

      {/* Visual Math Toolbar Header */}
      <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-2">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {MATH_SYMBOL_GROUPS.map((g) => (
            <button
              key={g.category}
              type="button"
              onClick={() => setActiveCategory(g.category)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${activeCategory === g.category
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
                }`}
            >
              {g.category}
            </button>
          ))}
        </div>

        {/* Quick Insert Buttons Grid */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentGroup.symbols.map((sym, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => insertLatex(sym.latex)}
              title={`Chèn ${sym.label}`}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:border-indigo-300 dark:hover:border-indigo-700 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-2xs group"
            >
              <MathText text={sym.preview} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] text-slate-400 font-normal">({sym.label})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Textarea Input */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans"
      />

      {/* Live Math Render Preview Box */}
      {value.trim() && (
        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-slate-950 border border-indigo-100 dark:border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Xem trước công thức hiển thị (Live Math Preview):</span>
          </div>
          <div className="text-sm text-slate-900 dark:text-slate-100 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-indigo-100/80 dark:border-slate-800">
            <MathText text={value} />
          </div>
        </div>
      )}
    </div>
  );
}
