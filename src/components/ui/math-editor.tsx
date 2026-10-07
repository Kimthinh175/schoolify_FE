'use client';

import * as React from 'react';
import {
  Sparkles,
  Eye,
  Edit3,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Check,
  Calculator,
  Compass,
  Layers,
  FileCode,
  BookOpen,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MathRenderer } from '@/components/ui/math-renderer';

export interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
}

export interface SymbolItem {
  display: string;
  insert: string;
  cursorOffset?: number; // Vị trí con trỏ sau khi chèn (tính từ đầu chuỗi insert)
  tooltip?: string;
}

export const POPULAR_SYMBOLS: SymbolItem[] = [
  { display: 'x²', insert: 'x²', tooltip: 'Bình phương' },
  { display: 'x³', insert: 'x³', tooltip: 'Lập phương' },
  { display: 'xⁿ', insert: 'x^[N]', cursorOffset: 3, tooltip: 'Lũy thừa bậc N: x^[N] (dễ chỉnh N, hiển thị xⁿ khi lên đề)' },
  { display: '√x', insert: '√(x)', cursorOffset: 2, tooltip: 'Căn bậc hai: √(x) (hiển thị căn thức chuẩn)' },
  { display: '∛x', insert: '∛(x)', cursorOffset: 2, tooltip: 'Căn bậc ba: ∛(x)' },
  { display: 'a/b', insert: '(a)/(b)', cursorOffset: 1, tooltip: 'Phân số: (a)/(b) (dễ chỉnh tử và mẫu, hiển thị phân số khi lên đề)' },
  { display: 'x₁', insert: 'x_[1]', cursorOffset: 3, tooltip: 'Chỉ số dưới: x_[1] (hiển thị x₁ khi lên đề)' },
  { display: 'x₂', insert: 'x_[2]', cursorOffset: 3, tooltip: 'Chỉ số dưới: x_[2]' },
  { display: 'y\'', insert: 'y\'', tooltip: 'Đạo hàm bậc 1' },
  { display: 'y\'\'', insert: 'y\'\'', tooltip: 'Đạo hàm bậc 2' },
  { display: '±', insert: '±', tooltip: 'Cộng trừ' },
  { display: '≠', insert: '≠', tooltip: 'Khác' },
  { display: '≤', insert: '≤', tooltip: 'Nhỏ hơn hoặc bằng' },
  { display: '≥', insert: '≥', tooltip: 'Lớn hơn hoặc bằng' },
  { display: '≈', insert: '≈', tooltip: 'Xấp xỉ' },
  { display: '∞', insert: '∞', tooltip: 'Vô cực' },
  { display: '+∞', insert: '+∞', tooltip: 'Dương vô cùng' },
  { display: '-∞', insert: '-∞', tooltip: 'Âm vô cùng' },
  { display: 'π', insert: 'π', tooltip: 'Số Pi' },
  { display: 'Δ', insert: 'Δ', tooltip: 'Biệt thức Delta' },
];

export const PHYSICS_SYMBOLS: SymbolItem[] = [
  { display: 'F⃗ = m.a⃗', insert: '$\\vec{F} = m.\\vec{a}$', tooltip: 'Định luật II Newton' },
  { display: 'v₀', insert: 'v_[0]', tooltip: 'Vận tốc ban đầu v₀ (hiển thị v₀ khi lên đề)' },
  { display: 'v = v₀+at', insert: '$v = v_[0] + a.t$', tooltip: 'Vận tốc biến đổi đều' },
  { display: 'x = A.cos(ωt+φ)', insert: '$x = A.\\cos(\\omega t + \\phi)$', tooltip: 'Dao động điều hòa' },
  { display: 'λ = v/f', insert: '$\\lambda = (v)/(f)$', tooltip: 'Bước sóng' },
  { display: 'T = 2π√(l/g)', insert: '$T = 2\\pi \\sqrt{(l)/(g)}$', tooltip: 'Chu kỳ con lắc đơn' },
  { display: 'I = U/R', insert: '$I = (U)/(R)$', tooltip: 'Định luật Ohm' },
  { display: 'P = U.I', insert: '$P = U.I$', tooltip: 'Công suất điện' },
  { display: 'W = 1/2mv²', insert: '$W = (1)/(2)m.v^[2]$', tooltip: 'Động năng' },
  { display: 'E = mc²', insert: '$E = m.c^[2]$', tooltip: 'Hệ thức Einstein' },
  { display: 'F⃗', insert: '$\\vec{F}$', tooltip: 'Vectơ lực' },
  { display: 'v⃗', insert: '$\\vec{v}$', tooltip: 'Vectơ vận tốc' },
  { display: 'a⃗', insert: '$\\vec{a}$', tooltip: 'Vectơ gia tốc' },
  { display: 'Ω', insert: ' \\Omega ', tooltip: 'Điện trở Ohm' },
  { display: 'μF', insert: ' \\mu F', tooltip: 'Microfarad' },
  { display: 'Δt', insert: '\\Delta t', tooltip: 'Khoảng thời gian' },
  { display: '°C', insert: '^[o]C', tooltip: 'Độ C' },
  { display: 'ω', insert: '\\omega ', tooltip: 'Tần số góc' },
  { display: 'λ', insert: '\\lambda ', tooltip: 'Bước sóng' },
  { display: 'ρ', insert: '\\rho ', tooltip: 'Khối lượng riêng/Điện trở suất' },
];

const CALCULUS_SYMBOLS: SymbolItem[] = [
  { display: 'y\'', insert: 'y\' = ', tooltip: 'Đạo hàm y\'' },
  { display: 'f\'(x)', insert: 'f\'(x) = ', tooltip: 'Đạo hàm f\'(x)' },
  { display: 'y\'\'', insert: 'y\'\' = ', tooltip: 'Đạo hàm cấp 2' },
  { display: 'lim(x→x₀)', insert: 'lim(x → x₀) ', cursorOffset: 9, tooltip: 'Giới hạn tại điểm' },
  { display: 'lim(x→+∞)', insert: 'lim(x → +∞) ', tooltip: 'Giới hạn tại dương vô cực' },
  { display: 'lim(x→-∞)', insert: 'lim(x → -∞) ', tooltip: 'Giới hạn tại âm vô cực' },
  { display: '∫ f(x)dx', insert: '∫ f(x) dx', cursorOffset: 2, tooltip: 'Nguyên hàm' },
  { display: '∫[a→b]', insert: '∫[a→b] f(x) dx', cursorOffset: 2, tooltip: 'Tích phân từ a đến b' },
  { display: 'x_CĐ', insert: 'x_CĐ = ', tooltip: 'Điểm cực đại' },
  { display: 'y_CĐ', insert: 'y_CĐ = ', tooltip: 'Giá trị cực đại' },
  { display: 'x_CT', insert: 'x_CT = ', tooltip: 'Điểm cực tiểu' },
  { display: 'y_CT', insert: 'y_CT = ', tooltip: 'Giá trị cực tiểu' },
  { display: 'max f(x)', insert: 'max f(x) = ', tooltip: 'Giá trị lớn nhất' },
  { display: 'min f(x)', insert: 'min f(x) = ', tooltip: 'Giá trị nhỏ nhất' },
  { display: 'e^x', insert: 'e^x', tooltip: 'Hàm số mũ cơ số e' },
  { display: 'ln(x)', insert: 'ln(x)', cursorOffset: 3, tooltip: 'Logarit tự nhiên' },
  { display: 'log_a(x)', insert: 'log_a(x)', cursorOffset: 4, tooltip: 'Logarit cơ số a' },
  { display: 'TCĐ: x =', insert: 'Tiệm cận đứng: x = ', tooltip: 'Tiệm cận đứng' },
  { display: 'TCN: y =', insert: 'Tiệm cận ngang: y = ', tooltip: 'Tiệm cận ngang' },
  { display: 'TCX: y =', insert: 'Tiệm cận xiên: y = ', tooltip: 'Tiệm cận xiên' },
];

const SETS_LOGIC_SYMBOLS: SymbolItem[] = [
  { display: 'ℝ', insert: 'ℝ', tooltip: 'Tập số thực' },
  { display: 'ℤ', insert: 'ℤ', tooltip: 'Tập số nguyên' },
  { display: 'ℕ', insert: 'ℕ', tooltip: 'Tập số tự nhiên' },
  { display: 'ℚ', insert: 'ℚ', tooltip: 'Tập số hữu tỉ' },
  { display: '∈', insert: ' ∈ ', tooltip: 'Thuộc' },
  { display: '∉', insert: ' ∉ ', tooltip: 'Không thuộc' },
  { display: '⊂', insert: ' ⊂ ', tooltip: 'Con' },
  { display: '∪', insert: ' ∪ ', tooltip: 'Hợp' },
  { display: '∩', insert: ' ∩ ', tooltip: 'Giao' },
  { display: '\\', insert: ' \\ ', tooltip: 'Hiệu tập hợp' },
  { display: '∅', insert: '∅', tooltip: 'Tập rỗng' },
  { display: '⇒', insert: ' ⇒ ', tooltip: 'Suy ra' },
  { display: '⇔', insert: ' ⇔ ', tooltip: 'Tương đương' },
  { display: '∀', insert: '∀', tooltip: 'Với mọi' },
  { display: '∃', insert: '∃', tooltip: 'Tồn tại' },
  { display: '[a; b]', insert: '[a; b]', cursorOffset: 1, tooltip: 'Đoạn từ a đến b' },
  { display: '(a; b)', insert: '(a; b)', cursorOffset: 1, tooltip: 'Khoảng từ a đến b' },
  { display: '[a; b)', insert: '[a; b)', cursorOffset: 1, tooltip: 'Nửa khoảng' },
  { display: '(a; b]', insert: '(a; b]', cursorOffset: 1, tooltip: 'Nửa khoảng' },
  { display: '{ ... }', insert: '{  }', cursorOffset: 2, tooltip: 'Tập hợp' },
];

const GEOMETRY_SYMBOLS: SymbolItem[] = [
  { display: 'u⃗', insert: 'u⃗', tooltip: 'Vectơ u' },
  { display: 'v⃗', insert: 'v⃗', tooltip: 'Vectơ v' },
  { display: 'AB⃗', insert: 'AB⃗', tooltip: 'Vectơ AB' },
  { display: '|u⃗|', insert: '|u⃗|', tooltip: 'Độ dài vectơ' },
  { display: '⊥', insert: ' ⊥ ', tooltip: 'Vuông góc' },
  { display: '∥', insert: ' ∥ ', tooltip: 'Song song' },
  { display: '∠ABC', insert: '∠ABC', tooltip: 'Góc ABC' },
  { display: '°', insert: '°', tooltip: 'Độ' },
  { display: 'ΔABC', insert: 'ΔABC', tooltip: 'Tam giác ABC' },
  { display: 'S_ABC', insert: 'S_ABC = ', tooltip: 'Diện tích tam giác' },
  { display: 'V_ABCD', insert: 'V = ', tooltip: 'Thể tích hình không gian' },
  { display: 'α', insert: 'α', tooltip: 'Góc Alpha' },
  { display: 'β', insert: 'β', tooltip: 'Góc Beta' },
  { display: 'φ', insert: 'φ', tooltip: 'Góc Phi' },
  { display: 'θ', insert: 'θ', tooltip: 'Góc Theta' },
  { display: 'ω', insert: 'ω', tooltip: 'Góc Omega' },
  { display: 'Oxyz', insert: 'Oxyz', tooltip: 'Hệ tọa độ không gian' },
  { display: '(P):', insert: 'Mặt phẳng (P): ', tooltip: 'Phương trình mặt phẳng' },
  { display: '(d):', insert: 'Đường thẳng (d): ', tooltip: 'Phương trình đường thẳng' },
  { display: '(S):', insert: 'Mặt cầu (S): ', tooltip: 'Phương trình mặt cầu' },
];

const MATH_TEMPLATES: SymbolItem[] = [
  {
    display: '• TXĐ: D = ℝ',
    insert: '1. Tập xác định: D = ℝ.\n',
    tooltip: 'Tập xác định',
  },
  {
    display: '• Tính đạo hàm y\'',
    insert: '2. Sự biến thiên:\n• Đạo hàm: y\' = \n• Cho y\' = 0 ⇔ \n',
    cursorOffset: 34,
    tooltip: 'Khung tính đạo hàm',
  },
  {
    display: '• Bảng biến thiên (BBT)',
    insert:
      '• Bảng biến thiên:\n  x   | -∞         x₁         x₂         +∞\n  y\'  |       +    0    -     0    +     \n  y   | -∞   ↗    y₁   ↘     y₂   ↗   +∞\n',
    tooltip: 'Khung bảng biến thiên',
  },
  {
    display: '• Kết luận đồng biến/nghịch biến',
    insert:
      '• Kết luận:\n  - Hàm số đồng biến trên các khoảng ( ; ) và ( ; ).\n  - Hàm số nghịch biến trên khoảng ( ; ).\n',
    cursorOffset: 52,
    tooltip: 'Kết luận tính đơn điệu',
  },
  {
    display: '• Kết luận cực trị',
    insert:
      '• Cực trị:\n  - Hàm số đạt cực đại tại x =  với y_CĐ = .\n  - Hàm số đạt cực tiểu tại x =  với y_CT = .\n',
    cursorOffset: 41,
    tooltip: 'Kết luận cực trị',
  },
  {
    display: '• Hệ phương trình { }',
    insert: '{\n  pt1: \n  pt2: \n}\n',
    cursorOffset: 9,
    tooltip: 'Khung hệ phương trình',
  },
];

export function MathEssayEditor({
  value,
  onChange,
  placeholder = 'Nhập bài làm tự luận của bạn tại đây...',
  rows = 8,
  className,
  label,
  helperText,
  disabled = false,
}: MathEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeCategory, setActiveCategory] = React.useState<
    'POPULAR' | 'PHYSICS' | 'CALCULUS' | 'SETS_LOGIC' | 'GEOMETRY' | 'TEMPLATES'
  >('POPULAR');
  const [isToolbarOpen, setIsToolbarOpen] = React.useState<boolean>(true);
  const [viewMode, setViewMode] = React.useState<'EDIT' | 'PREVIEW'>('EDIT');
  const [copied, setCopied] = React.useState(false);

  // Insert math symbol or snippet at the current cursor position
  const handleInsertSymbol = (item: SymbolItem) => {
    if (disabled || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;

    const before = value.substring(0, start);
    const after = value.substring(end);

    const newValue = before + item.insert + after;
    onChange(newValue);

    // Calculate new cursor position
    const offset = item.cursorOffset !== undefined ? item.cursorOffset : item.insert.length;
    const newCursorPos = start + offset;

    // Restore focus and set selection after React render
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleClear = () => {
    if (!value) return;
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung bài làm?')) {
      onChange('');
      textareaRef.current?.focus();
    }
  };

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Character and word counts
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  // Active Symbol List
  const currentSymbols = React.useMemo(() => {
    switch (activeCategory) {
      case 'PHYSICS':
        return PHYSICS_SYMBOLS;
      case 'CALCULUS':
        return CALCULUS_SYMBOLS;
      case 'SETS_LOGIC':
        return SETS_LOGIC_SYMBOLS;
      case 'GEOMETRY':
        return GEOMETRY_SYMBOLS;
      case 'TEMPLATES':
        return MATH_TEMPLATES;
      case 'POPULAR':
      default:
        return POPULAR_SYMBOLS;
    }
  }, [activeCategory]);

  return (
    <div className={cn('rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col', className)}>
      {/* ── TOP HEADER / TOOLBAR BAR ── */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {label ? (
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              {label}
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calculator className="w-4 h-4 text-[#00B8DD]" />
              Bộ Soạn Thảo Toán Học K-12
            </span>
          )}
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className="text-[11px] font-bold text-[#007D99] dark:text-[#00B8DD] hover:underline flex items-center gap-1 cursor-pointer"
          >
            {isToolbarOpen ? (
              <>
                <ChevronUp className="w-3 h-3" /> Thu gọn phím gõ
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> Mở bàn phím toán học
              </>
            )}
          </button>
        </div>

        {/* View Mode Toggle & Utility Buttons */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-0.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('EDIT')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer',
                viewMode === 'EDIT'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Edit3 className="w-3 h-3" /> Soạn Thảo
            </button>
            <button
              type="button"
              onClick={() => setViewMode('PREVIEW')}
              className={cn(
                'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer',
                viewMode === 'PREVIEW'
                  ? 'bg-white dark:bg-slate-900 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <Eye className="w-3 h-3" /> Xem Trước
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            disabled={!value}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 cursor-pointer"
            title="Sao chép toàn bộ"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={!value}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-30 cursor-pointer"
            title="Xóa trắng"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── INTERACTIVE MATH SYMBOL PALETTE ── */}
      {isToolbarOpen && viewMode === 'EDIT' && (
        <div className="bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200/80 dark:border-slate-800 p-3 space-y-2.5">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('POPULAR')}
              className={cn(
                'px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
                activeCategory === 'POPULAR'
                  ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#00B8DD]'
              )}
            >
              <Sparkles className="w-3 h-3" /> Thường Dùng
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('PHYSICS')}
              className={cn(
                'px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
                activeCategory === 'PHYSICS'
                  ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#00B8DD]'
              )}
            >
              <Zap className="w-3 h-3 text-amber-500" /> Vật Lý
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('CALCULUS')}
              className={cn(
                'px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
                activeCategory === 'CALCULUS'
                  ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#00B8DD]'
              )}
            >
              <Calculator className="w-3 h-3" /> Giải Tích & Đạo Hàm
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('SETS_LOGIC')}
              className={cn(
                'px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
                activeCategory === 'SETS_LOGIC'
                  ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#00B8DD]'
              )}
            >
              <Layers className="w-3 h-3" /> Tập Hợp & Logic
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('GEOMETRY')}
              className={cn(
                'px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
                activeCategory === 'GEOMETRY'
                  ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#00B8DD]'
              )}
            >
              <Compass className="w-3 h-3" /> Hình Học & Vectơ
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('TEMPLATES')}
              className={cn(
                'px-3 py-1 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer',
                activeCategory === 'TEMPLATES'
                  ? 'bg-[#00B8DD] text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-[#00B8DD]'
              )}
            >
              <FileCode className="w-3 h-3" /> Mẫu Lời Giải Nhanh
            </button>
          </div>

          {/* Symbol Buttons Grid */}
          <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1 no-scrollbar">
            {currentSymbols.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSymbol(item)}
                title={item.tooltip || item.insert}
                className={cn(
                  'px-2.5 py-1.5 rounded-xl border font-mono font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center text-xs',
                  activeCategory === 'TEMPLATES'
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-[#00B8DD] text-[11px] font-sans'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 hover:border-[#00B8DD] hover:bg-[#E6F8FC] dark:hover:bg-[#00B8DD]/20'
                )}
              >
                {item.display}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── EDITOR TEXTAREA OR PREVIEW PANE ── */}
      <div className="relative flex-1">
        {viewMode === 'EDIT' ? (
          <div className="flex flex-col">
            <textarea
              ref={textareaRef}
              rows={rows}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full p-4 sm:p-5 bg-transparent border-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono text-sm leading-relaxed focus:outline-none resize-y min-h-[160px]"
            />

            {/* Live Formula Preview */}
            {value.trim() && (
              <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem trước hiển thị công thức (khi lên đề):</span>
                </div>
                <div className="text-slate-800 dark:text-slate-200 text-sm overflow-x-auto py-1">
                  <MathRenderer text={value} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-5 min-h-[180px] bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 text-sm leading-relaxed overflow-y-auto">
            {value.trim() ? (
              <div className="space-y-2">
                <MathRenderer text={value} />
              </div>
            ) : (
              <p className="text-slate-400 italic text-xs">
                Chưa có nội dung bài làm để xem trước. Hãy chuyển sang tab &ldquo;Soạn Thảo&rdquo; để bắt đầu giải bài.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── FOOTER STATUS STRIP ── */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          {helperText || 'Gõ hoặc click ký hiệu toán học ở trên để chèn nhanh vào vị trí con trỏ.'}
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>{wordCount} từ</span>
          <span>•</span>
          <span>{charCount} ký tự</span>
        </div>
      </div>
    </div>
  );
}
