'use client';

import * as React from 'react';
import {
  ArrowLeft,
  Plus,
  DownloadCloud,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  BookOpen,
  X,
  ArrowUpDown,
  Filter,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { questionBankService } from '@/services/question-bank.service';
import { QuestionBank, Question, QuestionType } from '@/types';
import { MathText, cleanOptionText } from '@/components/ui/math-text';

interface QuestionBankDetailProps {
  bankId: string;
  onBack: () => void;
  onOpenQuestionModal: (question?: Question) => void;
  onOpenImportModal: (bankId: string) => void;
}

export function QuestionBankDetail({
  bankId,
  onBack,
  onOpenQuestionModal,
  onOpenImportModal,
}: QuestionBankDetailProps) {
  const [bank, setBank] = React.useState<QuestionBank | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeType, setActiveType] = React.useState<string>('ALL');
  const [sortBy, setSortBy] = React.useState<'NEWEST' | 'OLDEST' | 'POINTS_DESC' | 'POINTS_ASC'>('NEWEST');

  // Gợi ý tự động (Live Autocomplete Dropdown)
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return questions
      .filter(
        (q) =>
          q.content.toLowerCase().includes(query) ||
          (q.answers?.[0]?.explain && q.answers[0].explain.toLowerCase().includes(query))
      )
      .slice(0, 5);
  }, [questions, searchQuery]);

  const fetchDetail = React.useCallback(async () => {
    setLoading(true);
    try {
      const b = await questionBankService.getBank(bankId);
      setBank(b || null);
      setQuestions(b?.questions || []);
    } finally {
      setLoading(false);
    }
  }, [bankId]);

  React.useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleDeleteQuestion = async (qId: string) => {
    if (confirm('Bạn có muốn xóa câu hỏi này?')) {
      await questionBankService.deleteQuestion(bankId, qId);
      fetchDetail();
    }
  };

  const filteredQuestions = React.useMemo(() => {
    let result = questions.filter((q) => {
      if (activeType !== 'ALL' && q.type !== activeType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchContent = q.content.toLowerCase().includes(query);
        const matchExplain = q.answers?.[0]?.explain?.toLowerCase().includes(query) ?? false;
        if (!matchContent && !matchExplain) return false;
      }
      return true;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'POINTS_DESC') return (b.points || 0) - (a.points || 0);
      if (sortBy === 'POINTS_ASC') return (a.points || 0) - (b.points || 0);
      if (sortBy === 'OLDEST') return (a.created_at || '').localeCompare(b.created_at || '');
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
  }, [questions, activeType, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveType('ALL');
    setSortBy('NEWEST');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  if (!bank) {
    return (
      <Card className="p-8 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          Không tìm thấy ngân hàng đề thi
        </p>
        <Button onClick={onBack} variant="outline" size="sm">
          Quay lại danh sách
        </Button>
      </Card>
    );
  }

  const isFiltered = searchQuery.trim() !== '' || activeType !== 'ALL' || sortBy !== 'NEWEST';

  return (
    <div className="space-y-6">
      {/* Header Back & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Quay lại
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{bank.title}</h2>
              <Badge variant={bank.is_premium ? 'warning' : 'secondary'} className="text-[10px]">
                {bank.is_premium ? '⭐ PREMIUM' : 'Miễn Phí'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {questions.length} câu hỏi • Cập nhật gần nhất:{' '}
              {new Date(bank.updated_at || bank.created_at).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenImportModal(bank.id)}
            leftIcon={<DownloadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          >
            Import Từ File
          </Button>
          <Button
            onClick={() => onOpenQuestionModal()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Soạn Câu Hỏi Thủ Công
          </Button>
        </div>
      </div>

      {/* Expanded Desktop Search & Comprehensive Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-sm">
        {/* Search Input with Live Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative w-full md:w-96 lg:w-[420px] xl:w-[480px] shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm theo từ khóa câu hỏi, nội dung, đáp án..."
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="pl-9 pr-8 text-xs h-10 rounded-xl focus:ring-purple-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              title="Xóa từ khóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Floating Live Autocomplete Dropdown */}
          {isDropdownOpen && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>⚡ Gợi ý câu hỏi ({searchSuggestions.length})</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">Tự động tìm kiếm</span>
              </div>

              {searchSuggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Không tìm thấy câu hỏi nào chứa từ khóa "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {searchSuggestions.map((q, idx) => (
                    <button
                      key={q.id || idx}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        const el = document.getElementById(`q-card-${q.id}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="purple" className="text-[9px] px-1.5 py-0.5 shrink-0">
                          {q.type}
                        </Badge>
                        <div className="min-w-0 truncate text-xs text-slate-800 dark:text-slate-200 font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          <MathText text={q.content} />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {q.points}đ
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Type Pills & Sort Control */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sắp xếp Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="OLDEST">Cũ nhất</option>
              <option value="POINTS_DESC">Điểm số: Cao → Thấp</option>
              <option value="POINTS_ASC">Điểm số: Thấp → Cao</option>
            </select>
          </div>

          {/* Reset button if filtered */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500 hover:text-purple-600 h-9 px-2.5"
            >
              Đặt lại lọc
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs by Question Type */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5">
          {[
            { key: 'ALL', label: `Tất cả (${questions.length})` },
            { key: 'SINGLE_CHOICE', label: '1 Đáp án' },
            { key: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án' },
            { key: 'TRUE_FALSE', label: 'Đúng / Sai' },
            { key: 'ESSAY', label: 'Tự luận' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveType(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${activeType === tab.key
                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-400 shrink-0 hidden sm:inline">
          Đang hiển thị <strong className="text-purple-600 dark:text-purple-400">{filteredQuestions.length}</strong> / {questions.length} câu
        </span>
      </div>

      {/* Question Cards List */}
      {filteredQuestions.length === 0 ? (
        <Card className="p-10 text-center space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Chưa có câu hỏi nào trong mục này
          </p>
          <div className="flex justify-center gap-2 pt-1">
            <Button size="sm" onClick={() => onOpenQuestionModal()}>
              Thêm Câu Hỏi Mới
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenImportModal(bank.id)}>
              Import Từ File Word/Excel
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <Card key={q.id} id={`q-card-${q.id}`} className="p-5 space-y-4 hover:border-purple-200 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <Badge variant="purple" className="text-[10px]">
                    {q.type}
                  </Badge>
                  <span className="text-xs text-slate-400 font-medium">({q.points} điểm)</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenQuestionModal(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                    title="Chỉnh sửa câu hỏi"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Xóa câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Nội dung câu hỏi (hỗ trợ preview Markdown / công thức toán / ảnh) */}
              <div className="text-sm font-bold text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                <MathText text={q.content} />
              </div>

              {/* Hình ảnh minh họa (nếu có) */}
              {q.img_urls && q.img_urls.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {q.img_urls.map((url, imgIdx) => (
                    <div key={imgIdx} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-1">
                      <img src={url} alt={`Hình minh họa ${imgIdx + 1}`} className="h-28 max-w-[280px] object-contain rounded-lg" />
                    </div>
                  ))}
                </div>
              )}

              {/* Danh sách đáp án */}
              {q.answers && q.answers.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.answers.map((ans, aIdx) => {
                    const letter = String.fromCharCode(65 + aIdx);
                    return (
                      <div
                        key={ans.id || aIdx}
                        className={`p-2.5 rounded-xl text-xs flex items-center gap-2.5 border transition-all ${ans.is_answer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold dark:bg-emerald-950/30 dark:border-emerald-800/80 dark:text-emerald-300 shadow-sm'
                            : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                      >
                        <span
                          className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${ans.is_answer
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                        >
                          {ans.is_answer ? <CheckCircle2 className="w-3.5 h-3.5" /> : letter}
                        </span>
                        <span className="flex-1">
                          <MathText text={cleanOptionText(ans.content)} />
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Lời giải / Explain */}
              {q.answers?.[0]?.explain && (
                <div className="p-3 rounded-r-xl border-l-4 border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-xs text-purple-900 dark:text-purple-300">
                  <span className="font-bold">✨ Lời giải chi tiết:</span> <MathText text={q.answers[0].explain} />
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
