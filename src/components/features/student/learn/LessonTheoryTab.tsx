'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  BookOpen,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Bookmark,
  FunctionSquare,
  FileCheck,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MathText } from '@/components/ui/math-text';

// Interface definitions for Theory Tab Content
export interface TheoryDefinition {
  id: string;
  title: string;
  summary: string;
  highlightedKeywords: string[];
  keyNotes?: string[];
}

export interface TheoryFormula {
  id: string;
  category: string;
  name: string;
  expressionLatex: string;
  condition?: string;
  explanation?: string;
}

export interface ExampleStep {
  stepNumber: number;
  title: string;
  content: string;
  formulaUsed?: string;
}

export interface TheoryExample {
  id: string;
  title: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Nâng cao';
  problemStatement: string;
  steps: ExampleStep[];
  finalAnswer: string;
}

export interface LessonTheoryTabProps {
  definitions?: TheoryDefinition[];
  formulas?: TheoryFormula[];
  examples?: TheoryExample[];
  onNavigateToQuiz?: () => void;
  className?: string;
}

// Default Data Mock if props are omitted
const DEFAULT_DEFINITIONS: TheoryDefinition[] = [
  {
    id: 'def-1',
    title: 'Định nghĩa Giá trị lượng giác của một góc lượng giác',
    summary:
      'Trên đường tròn lượng giác tâm $O$, cho điểm $M(x; y)$ tương ứng với góc lượng giác $\\alpha$. Các giá trị $\\cos(\\alpha) = x$, $\\sin(\\alpha) = y$, $\\tan(\\alpha) = \\frac{y}{x}$ ($x \\neq 0$) và $\\cot(\\alpha) = \\frac{x}{y}$ ($y \\neq 0$) được gọi là các giá trị lượng giác của góc $\\alpha$.',
    highlightedKeywords: ['Đường tròn lượng giác', 'Tung độ (sin)', 'Hoành độ (cos)', 'Điều kiện xác định'],
    keyNotes: [
      'Góc $\\alpha$ thuộc góc phần tư I: Tất cả các giá trị $\\sin, \\cos, \\tan, \\cot$ đều dương (> 0).',
      'Góc $\\alpha$ thuộc góc phần tư II: $\\sin \\alpha > 0$, các giá trị còn lại âm (< 0).',
    ],
  },
];

const DEFAULT_FORMULAS: TheoryFormula[] = [
  {
    id: 'f-1',
    category: 'Công thức cơ bản',
    name: 'Hằng đẳng thức lượng giác cốt lõi',
    expressionLatex: '\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1',
    condition: 'Mọi góc $\\alpha \\in \\mathbb{R}$',
    explanation: 'Xuất phát từ phương trình đường tròn đơn vị $x^2 + y^2 = 1$.',
  },
  {
    id: 'f-2',
    category: 'Công thức cơ bản',
    name: 'Mối liên hệ giữa Tan và Cot',
    expressionLatex: '\\tan(\\alpha) \\cdot \\cot(\\alpha) = 1',
    condition: '$\\alpha \\neq k\\frac{\\pi}{2} \\quad (k \\in \\mathbb{Z})$',
    explanation: 'Áp dụng định nghĩa $\\tan\\alpha = \\frac{y}{x}$ và $\\cot\\alpha = \\frac{x}{y}$.',
  },
  {
    id: 'f-3',
    category: 'Công thức liên kết',
    name: 'Công thức biến đổi 1 + tan²',
    expressionLatex: '1 + \\tan^2(\\alpha) = \\frac{1}{\\cos^2(\\alpha)}',
    condition: '$\\cos\\alpha \\neq 0 \\iff \\alpha \\neq \\frac{\\pi}{2} + k\\pi$',
    explanation: 'Chia cả 2 vế của $\\sin^2\\alpha + \\cos^2\\alpha = 1$ cho $\\cos^2\\alpha$.',
  },
  {
    id: 'f-4',
    category: 'Công thức cộng',
    name: 'Công thức cộng cho Sin và Cos',
    expressionLatex: '\\sin(a + b) = \\sin(a)\\cos(b) + \\cos(a)\\sin(b)',
    condition: 'Mọi $a, b \\in \\mathbb{R}$',
    explanation: 'Giúp tính giá trị lượng giác của tổng hai góc bất kỳ.',
  },
];

const DEFAULT_EXAMPLES: TheoryExample[] = [
  {
    id: 'ex-1',
    title: 'Ví dụ 1: Tính giá trị lượng giác còn lại khi biết $\\sin(\\alpha)$',
    difficulty: 'Cơ bản',
    problemStatement:
      'Cho $\\sin(\\alpha) = \\frac{3}{5}$ với $\\frac{\\pi}{2} < \\alpha < \\pi$ (Góc phần tư thứ II). Hãy tính giá trị của $\\cos(\\alpha)$, $\\tan(\\alpha)$ và $\\cot(\\alpha)$.',
    steps: [
      {
        stepNumber: 1,
        title: 'Áp dụng hằng đẳng thức cốt lõi',
        content:
          'Ta có công thức: $\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1 \\implies \\cos^2(\\alpha) = 1 - \\sin^2(\\alpha)$.\nThay số: $\\cos^2(\\alpha) = 1 - \\left(\\frac{3}{5}\\right)^2 = 1 - \\frac{9}{25} = \\frac{16}{25}$.',
        formulaUsed: '\\sin^2(\\alpha) + \\cos^2(\\alpha) = 1',
      },
      {
        stepNumber: 2,
        title: 'Xét dấu theo góc phần tư II',
        content:
          'Vì $\\frac{\\pi}{2} < \\alpha < \\pi$ nên góc $\\alpha$ thuộc góc phần tư thứ II. Do đó $\\cos(\\alpha) < 0$.\nSuy ra: $\\cos(\\alpha) = -\\sqrt{\\frac{16}{25}} = -\\frac{4}{5}$.',
      },
      {
        stepNumber: 3,
        title: 'Tính Tan và Cot theo định nghĩa',
        content:
          '• $\\tan(\\alpha) = \\frac{\\sin(\\alpha)}{\\cos(\\alpha)} = \\frac{3}{5} : \\left(-\\frac{4}{5}\\right) = -\\frac{3}{4}$.\n• $\\cot(\\alpha) = \\frac{1}{\\tan(\\alpha)} = -\\frac{4}{3}$.',
        formulaUsed: '\\tan(\\alpha) = \\frac{\\sin(\\alpha)}{\\cos(\\alpha)}',
      },
    ],
    finalAnswer:
      'Kết quả: $\\cos(\\alpha) = -\\frac{4}{5}$, $\\tan(\\alpha) = -\\frac{3}{4}$, $\\cot(\\alpha) = -\\frac{4}{3}$.',
  },
  {
    id: 'ex-2',
    title: 'Ví dụ 2: Rút gọn biểu thức lượng giác có chứa điều kiện xác định',
    difficulty: 'Trung bình',
    problemStatement:
      'Rút gọn biểu thức $P = \\frac{1 - \\cos^2(\\alpha)}{\\sin(\\alpha) \\cdot \\cos(\\alpha)}$ với giả thiết các biểu thức đều có nghĩa.',
    steps: [
      {
        stepNumber: 1,
        title: 'Thay thế tử số bằng hằng đẳng thức',
        content:
          'Nhận thấy tử số $1 - \\cos^2(\\alpha) = \\sin^2(\\alpha)$ theo hằng đẳng thức cơ bản.',
        formulaUsed: '1 - \\cos^2(\\alpha) = \\sin^2(\\alpha)',
      },
      {
        stepNumber: 2,
        title: 'Triệt tiêu mẫu số',
        content:
          'Biểu thức trở thành: $P = \\frac{\\sin^2(\\alpha)}{\\sin(\\alpha) \\cdot \\cos(\\alpha)} = \\frac{\\sin(\\alpha)}{\\cos(\\alpha)}$.',
      },
      {
        stepNumber: 3,
        title: 'Đổi về dạng tỉ số Tan',
        content: 'Theo định nghĩa, $\\frac{\\sin(\\alpha)}{\\cos(\\alpha)} = \\tan(\\alpha)$.',
      },
    ],
    finalAnswer: 'Biểu thức thu gọn: $P = \\tan(\\alpha)$.',
  },
];

export function LessonTheoryTab({
  definitions = DEFAULT_DEFINITIONS,
  formulas = DEFAULT_FORMULAS,
  examples = DEFAULT_EXAMPLES,
  onNavigateToQuiz,
  className = '',
}: LessonTheoryTabProps) {
  const safeDefinitions = definitions && definitions.length > 0 ? definitions : DEFAULT_DEFINITIONS;
  const safeFormulas = formulas && formulas.length > 0 ? formulas : DEFAULT_FORMULAS;
  const safeExamples = examples && examples.length > 0 ? examples : DEFAULT_EXAMPLES;

  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [openExampleIds, setOpenExampleIds] = React.useState<string[]>([safeExamples[0]?.id || 'ex-1']);
  const [selectedFormulaCategory, setSelectedFormulaCategory] = React.useState<string>('Tất cả');

  // Extract unique formula categories
  const categories = React.useMemo(() => {
    const set = new Set(safeFormulas.map((f) => f.category));
    return ['Tất cả', ...Array.from(set)];
  }, [safeFormulas]);

  const filteredFormulas = React.useMemo(() => {
    if (selectedFormulaCategory === 'Tất cả') return safeFormulas;
    return safeFormulas.filter((f) => f.category === selectedFormulaCategory);
  }, [safeFormulas, selectedFormulaCategory]);

  const handleCopyFormula = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExample = (id: string) => {
    setOpenExampleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className={`space-y-8 pb-12 ${className}`}>
      {/* SECTION 1: CORE DEFINITION (Bóng đèn + Card sáng mượt) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            1. Tóm Tắt Định Nghĩa Cốt Lõi
          </h2>
        </div>

        {safeDefinitions.map((def) => (
          <div
            key={def.id}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/5 via-indigo-50/50 to-white dark:to-slate-900 p-5 sm:p-6 border border-amber-200 dark:border-amber-900/40 shadow-sm hover:shadow-md transition-all"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-amber-400/60 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-semibold px-2.5 py-0.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1 inline text-amber-600" />
                    Khái niệm cơ bản
                  </Badge>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-amber-100">
                {def.title}
              </h3>

              <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <MathText text={def.summary} />
              </div>

              {/* Keywords list */}
              {def.highlightedKeywords && def.highlightedKeywords.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Từ khóa:
                  </span>
                  {def.highlightedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 text-xs font-medium border border-amber-200/80 dark:border-amber-800/60"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Important Notes */}
              {def.keyNotes && def.keyNotes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    Lưu ý xét dấu quan trọng:
                  </p>
                  <ul className="list-disc list-inside space-y-1 pl-1 font-medium">
                    {def.keyNotes.map((note, idx) => (
                      <li key={idx}>
                        <MathText text={note} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      {/* SECTION 2: FORMULAS (Màu tông sáng + MathText sắc nét) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FunctionSquare className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Các Công Thức Toán Học / Khoa Học
            </h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFormulaCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedFormulaCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFormulas.map((f) => (
            <div
              key={f.id}
              className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4.5 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all shadow-xs hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    {f.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] shrink-0 font-medium bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {f.category}
                  </Badge>
                </div>

                {/* Light Math Expression Container */}
                <div className="relative p-4 rounded-xl bg-gradient-to-r from-indigo-50/60 via-slate-50 to-indigo-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-indigo-100 dark:border-indigo-950/60 text-center flex items-center justify-center min-h-[4rem] shadow-xs">
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    <MathText text={`$${f.expressionLatex}$`} />
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyFormula(f.id, f.expressionLatex)}
                    title="Sao chép mã LaTeX công thức"
                    className="absolute right-2.5 top-2.5 p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200/80 dark:border-slate-700 transition-colors shadow-xs"
                  >
                    {copiedId === f.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Condition & Explanation */}
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  {f.condition && (
                    <div className="flex items-start gap-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Điều kiện:</span>
                      <div className="text-slate-800 dark:text-slate-200">
                        <MathText text={f.condition.includes('$') || !f.condition.includes('\\') ? f.condition : `$${f.condition}$`} />
                      </div>
                    </div>
                  )}
                  {f.explanation && (
                    <div className="italic text-slate-500 dark:text-slate-400 flex items-start gap-1.5 pt-0.5">
                      <span className="shrink-0 not-italic">💡</span>
                      <div>
                        <MathText text={f.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: WORKED EXAMPLES (Ví dụ mẫu + Lời giải từng bước) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <FileCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Ví Dụ Mẫu & Lời Giải Chi Tiết Từng Bước
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {safeExamples.map((ex) => {
            const isOpen = openExampleIds.includes(ex.id);
            return (
              <div
                key={ex.id}
                className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all"
              >
                {/* Example Header Card */}
                <div
                  onClick={() => toggleExample(ex.id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant={
                          ex.difficulty === 'Cơ bản'
                            ? 'success'
                            : ex.difficulty === 'Trung bình'
                            ? 'primary'
                            : 'warning'
                        }
                        className="text-[11px]"
                      >
                        {ex.difficulty}
                      </Badge>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                        <MathText text={ex.title} />
                      </h3>
                    </div>

                    <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-100/70 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">
                        Đề bài:
                      </span>
                      <MathText text={ex.problemStatement} />
                    </div>
                  </div>

                  <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0 mt-1">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Step-by-Step Solution Accordion */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-4 sm:p-5 space-y-4"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" /> Lời giải chi tiết từng bước:
                      </div>

                      <div className="space-y-3 pl-2 sm:pl-4 border-l-2 border-indigo-500/40 dark:border-indigo-400/40">
                        {ex.steps.map((step) => (
                          <div
                            key={step.stepNumber}
                            className="relative pl-4 space-y-1.5 group"
                          >
                            {/* Step Indicator Dot */}
                            <div className="absolute -left-[1.35rem] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-50 dark:ring-slate-950" />

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                                Bước {step.stepNumber}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                {step.title}
                              </h4>
                            </div>

                            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans pt-1">
                              <MathText text={step.content} />
                            </div>

                            {step.formulaUsed && (
                              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/50">
                                <span>Áp dụng:</span>
                                <MathText text={`$${step.formulaUsed}$`} />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Final Answer Highlight Box */}
                      <div className="mt-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <MathText text={ex.finalAnswer} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: NEXT ACTION FOOTER (Nút chuyển tiếp sang Trắc nghiệm) */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Bạn đã đọc xong tóm tắt Lý thuyết & Ví dụ mẫu.</span>
        </div>

        <Button
          onClick={onNavigateToQuiz}
          size="lg"
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 font-bold gap-2 px-6 rounded-xl"
        >
          <span>Chuyển Sang Phần 2: Trắc Nghiệm</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
