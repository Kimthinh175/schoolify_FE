'use client';

import * as React from 'react';
import {
  BookOpen,
  FileText,
  Code,
  PenTool,
  Calculator,
  Bold,
  Italic,
  List,
  Quote,
  Sparkles,
  Globe,
  Landmark,
  Compass,
  Check,
} from 'lucide-react';
import { MathEssayEditor } from '@/components/ui/math-editor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SubjectEssayEditorProps {
  subjectSlug?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  disabled?: boolean;
}

export function SubjectEssayEditor({
  subjectSlug = 'toan-hoc',
  value,
  onChange,
  rows = 9,
  disabled = false,
}: SubjectEssayEditorProps) {
  const normSlug = subjectSlug.toLowerCase().trim();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Tính số từ & ký tự cho các môn văn/tiếng anh/xã hội
  const wordCount = React.useMemo(() => {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [value]);

  const charCount = value.length;

  // Hàm chèn text vào vị trí con trỏ hiện tại
  const handleInsertText = (textToInsert: string) => {
    if (disabled || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;

    const before = value.substring(0, start);
    const after = value.substring(end);
    const newValue = before + textToInsert + after;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + textToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // Hàm bọc định dạng (In đậm, In nghiêng, Trích dẫn)
  const handleWrapText = (prefix: string, suffix: string = prefix, defaultPlaceholder = 'nội dung') => {
    if (disabled || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;

    const selected = value.substring(start, end) || defaultPlaceholder;
    const before = value.substring(0, start);
    const after = value.substring(end);

    const wrapped = `${prefix}${selected}${suffix}`;
    const newValue = before + wrapped + after;
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  // =========================================================================
  // 1. NHÓM 1: TOÁN HỌC, VẬT LÝ, HÓA HỌC, SINH HỌC (STEM / KHTN)
  // Sử dụng MathEssayEditor chuyên dụng có bàn phím KaTeX, căn bậc, tích phân
  // =========================================================================
  if (
    normSlug.includes('toan') ||
    normSlug.includes('vat-ly') ||
    normSlug.includes('hoa-hoc') ||
    normSlug.includes('sinh-hoc')
  ) {
    let stemPlaceholder = 'Trình bày chi tiết từng bước: Tập xác định -> Đạo hàm / Biến đổi -> Biện luận -> Kết luận...';
    let stemSubjectTitle = 'Toán Học';

    if (normSlug.includes('vat-ly')) {
      stemPlaceholder = 'Tóm tắt giả thiết -> Viết công thức gốc -> Biến đổi và thế số -> Đơn vị và kết luận...';
      stemSubjectTitle = 'Vật Lý';
    } else if (normSlug.includes('hoa-hoc')) {
      stemPlaceholder = 'Phương trình phản ứng hóa học -> Tính số mol -> Lập hệ phương trình -> Kết luận đáp số...';
      stemSubjectTitle = 'Hóa Học';
    } else if (normSlug.includes('sinh-hoc')) {
      stemPlaceholder = 'Xác định quy luật di truyền / cơ chế sinh học -> Lập sơ đồ lai hoặc công thức -> Biện luận và kết luận...';
      stemSubjectTitle = 'Sinh Học';
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 px-1">
          <Badge className="bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 text-[11px] font-bold">
            <Calculator className="w-3.5 h-3.5 mr-1 text-sky-500" />
            Tự luận {stemSubjectTitle} • Hỗ trợ KaTeX &amp; Ký hiệu khoa học
          </Badge>
          <span className="text-[11px] text-slate-400">
            {charCount} ký tự
          </span>
        </div>
        <MathEssayEditor
          value={value}
          onChange={onChange}
          placeholder={stemPlaceholder}
          rows={rows}
          disabled={disabled}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. NHÓM 2: NGỮ VĂN (LITERATURE)
  // Giao diện viết văn nghị luận / cảm thụ: đếm số từ, khung bố cục Mở-Thân-Kết
  // =========================================================================
  if (normSlug.includes('van') || normSlug.includes('ngu-van')) {
    const essayOutlines = [
      { label: '📌 Mở bài', insert: '\n[Mở bài]: Giới thiệu tác giả, tác phẩm và luận đề nghị luận...' },
      { label: '💡 Luận điểm 1', insert: '\n[Luận điểm 1]: ' },
      { label: '💡 Luận điểm 2', insert: '\n[Luận điểm 2]: ' },
      { label: '📖 Dẫn chứng', insert: ' (Dẫn chứng: "...") ' },
      { label: '🎯 Đánh giá', insert: '\n[Đánh giá nghệ thuật & nội dung]: ' },
      { label: '✨ Kết bài', insert: '\n[Kết bài]: Khẳng định lại giá trị tác phẩm và bài học nhận thức...' },
    ];

    return (
      <div className="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Badge className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 text-[11px] font-bold">
              <BookOpen className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Tự Luận Ngữ Văn • Bố Cục Nghị Luận
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-[#007D99] dark:text-[#00B8DD] font-black">{wordCount} từ</span>
            <span>•</span>
            <span>{charCount} ký tự</span>
          </div>
        </div>

        {/* Toolbar Công cụ hỗ trợ viết văn */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Định dạng văn bản */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleWrapText('**', '**', 'chữ in đậm')}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-bold"
              title="In đậm (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleWrapText('*', '*', 'chữ in nghiêng')}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors italic"
              title="In nghiêng (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleWrapText('« ', ' »', 'trích dẫn tác phẩm')}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Trích dẫn văn học (« »)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleInsertText('\n- ')}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              title="Gạch đầu dòng ý"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gợi ý khung dàn ý nhanh */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Chèn dàn ý:</span>
            {essayOutlines.map((item, idx) => (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => handleInsertText(item.insert)}
                className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-[#00B8DD]/10 hover:text-[#007D99] dark:hover:text-[#00B8DD] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Ngữ Văn */}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder="Trình bày bài văn hoặc đoạn văn nghị luận của bạn tại đây...&#10;• Mở bài: Dẫn dắt vấn đề và nêu luận đề bài viết.&#10;• Thân bài: Phân tích từng luận điểm kết hợp dẫn chứng xác thực, sâu sắc.&#10;• Kết bài: Tổng kết giá trị tác phẩm và liên hệ nhận thức bản thân."
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 transition-all font-sans resize-y"
        />
      </div>
    );
  }

  // =========================================================================
  // 3. NHÓM 3: TIẾNG ANH (ENGLISH WRITING)
  // Giao diện viết bài luận tiếng Anh: bộ từ nối học thuật (Linking words), đếm từ
  // =========================================================================
  if (normSlug.includes('anh') || normSlug.includes('tieng-anh') || normSlug.includes('english')) {
    const linkingWords = [
      'In my opinion,',
      'Furthermore,',
      'On the one hand,',
      'On the other hand,',
      'For instance,',
      'Consequently,',
      'In conclusion,',
    ];

    return (
      <div className="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Badge className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[11px] font-bold">
            <Globe className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            English Writing Task • Academic Essay Editor
          </Badge>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="text-[#007D99] dark:text-[#00B8DD] font-black">{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        {/* Linking Words Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Connectors:</span>
          {linkingWords.map((word, idx) => (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => handleInsertText(` ${word} `)}
              className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-[#00B8DD]/10 hover:text-[#007D99] dark:hover:text-[#00B8DD] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {word}
            </button>
          ))}
        </div>

        {/* Textarea English */}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder="Write your answer or essay in English here...&#10;• Introduction: Paraphrase the prompt & state your position clearly.&#10;• Body Paragraph 1: Main argument, explanation, and concrete examples.&#10;• Body Paragraph 2: Supporting/contrasting viewpoint with evidence.&#10;• Conclusion: Restate thesis and summarize your core ideas."
          className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 transition-all font-sans resize-y"
          spellCheck={true}
        />
      </div>
    );
  }

  // =========================================================================
  // 4. NHÓM 4: TIN HỌC (COMPUTER SCIENCE / PROGRAMMING)
  // Giao diện gõ code: phông Monospace, chọn ngôn ngữ (Python / C++), hỗ trợ Tab
  // =========================================================================
  if (normSlug.includes('tin') || normSlug.includes('tin-hoc')) {
    const [codeLang, setCodeLang] = React.useState<'python' | 'cpp' | 'pascal'>('python');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Hỗ trợ bấm phím Tab để thụt dòng 4 spaces thay vì mất focus
      if (e.key === 'Tab') {
        e.preventDefault();
        handleInsertText('    ');
      }
    };

    return (
      <div className="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Badge className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 text-[11px] font-bold">
            <Code className="w-3.5 h-3.5 mr-1 text-indigo-500" />
            Mã Nguồn / Lời Giải Thuật Toán Tin Học
          </Badge>

          {/* Chọn ngôn ngữ lập trình */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
            {(['python', 'cpp', 'pascal'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setCodeLang(lang)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-[11px] transition-colors',
                  codeLang === lang
                    ? 'bg-[#00B8DD] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {lang === 'python' ? 'Python 3' : lang === 'cpp' ? 'C++ 20' : 'Pascal'}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Code Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={
            codeLang === 'python'
              ? '# Viết mã nguồn Python 3 tại đây...\ndef solve():\n    # Nhập dữ liệu và xử lý thuật toán\n    pass\n\nif __name__ == "__main__":\n    solve()'
              : codeLang === 'cpp'
              ? '// Viết mã nguồn C++ tại đây...\n#include <iostream>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    return 0;\n}'
              : '// Viết lời giải thuật toán hoặc mã nguồn Pascal tại đây...'
          }
          className="w-full p-4 rounded-xl border border-slate-700 bg-slate-950 text-emerald-400 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00B8DD] transition-all resize-y select-text"
          spellCheck={false}
        />
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>💡 Phím <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">Tab</kbd> thụt 4 khoảng trắng.</span>
          <span>{value.split('\n').length} dòng mã</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. NHÓM 5: KHOA HỌC XÃ HỘI (LỊCH SỬ, ĐỊA LÝ, GDCD, KINH TẾ & PHÁP LUẬT)
  // Giao diện phân tích luận điểm: Nguyên nhân - Diễn biến - Ý nghĩa - Liên hệ
  // =========================================================================
  const socialOutlines = [
    { label: '🏛️ Bối cảnh & Nguyên nhân', insert: '\n1. Bối cảnh & Nguyên nhân: ' },
    { label: '⚡ Diễn biến / Nội dung chính', insert: '\n2. Diễn biến / Nội dung cốt lõi: ' },
    { label: '🏆 Ý nghĩa & Tác động', insert: '\n3. Ý nghĩa, giá trị & tác động: ' },
    { label: '🌍 Bài học & Liên hệ thực tiễn', insert: '\n4. Bài học kinh nghiệm & Liên hệ thực tế: ' },
  ];

  return (
    <div className="space-y-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Badge className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[11px] font-bold">
          <Landmark className="w-3.5 h-3.5 mr-1 text-amber-500" />
          Tự Luận Khoa Học Xã Hội • Luận Điểm Chặt Chẽ
        </Badge>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="text-[#007D99] dark:text-[#00B8DD] font-black">{wordCount} từ</span>
          <span>•</span>
          <span>{charCount} ký tự</span>
        </div>
      </div>

      {/* Outlines Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Khung phân tích:</span>
        {socialOutlines.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => handleInsertText(item.insert)}
            className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-[#00B8DD]/10 hover:text-[#007D99] dark:hover:text-[#00B8DD] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Textarea Xã hội */}
      <textarea
        ref={textareaRef}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder="Trình bày câu trả lời tự luận theo các luận điểm rõ ràng:&#10;1. Nêu bối cảnh lịch sử, tiền đề địa lý hoặc cơ sở pháp lý liên quan.&#10;2. Phân tích nội dung cốt lõi, số liệu và luận cứ xác đáng.&#10;3. Đánh giá ý nghĩa, hệ quả và liên hệ thực tế Việt Nam hiện nay."
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#00B8DD] focus:bg-white dark:focus:bg-slate-900 transition-all font-sans resize-y"
      />
    </div>
  );
}
