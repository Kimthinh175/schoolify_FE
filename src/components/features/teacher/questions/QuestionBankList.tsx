'use client';

import * as React from 'react';
import {
  Plus,
  BookOpen,
  Sparkles,
  Search,
  DownloadCloud,
  FileQuestion,
  Star,
  Trash2,
  Eye,
  X,
  ArrowUpDown,
  Filter,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { questionBankService } from '@/services/question-bank.service';
import { QuestionBank } from '@/types';

interface QuestionBankListProps {
  onSelectBank: (bankId: string) => void;
  onOpenImportModal: (bankId?: string) => void;
}

export function QuestionBankList({
  onSelectBank,
  onOpenImportModal,
}: QuestionBankListProps) {
  const [banks, setBanks] = React.useState<QuestionBank[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [premiumFilter, setPremiumFilter] = React.useState<'ALL' | 'PREMIUM' | 'FREE'>('ALL');
  const [subjectFilter, setSubjectFilter] = React.useState<string>('ALL');
  const [sortBy, setSortBy] = React.useState<'NEWEST' | 'COUNT_DESC' | 'USED_DESC'>('NEWEST');

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
    const q = searchQuery.toLowerCase().trim();
    return banks
      .filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          (b.subject && b.subject.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [banks, searchQuery]);

  // Modal Tạo Ngân Hàng Mới
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isPremium, setIsPremium] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchBanks = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await questionBankService.getBanks('tchr-01');
      setBanks(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const handleCreateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await questionBankService.createBank({
        title: title.trim(),
        description: description.trim(),
        is_premium: isPremium,
        owner_id: 'tchr-01',
      });
      setTitle('');
      setDescription('');
      setIsPremium(false);
      setIsCreateOpen(false);
      fetchBanks();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePremium = async (bankId: string, currentVal: boolean) => {
    await questionBankService.togglePremium(bankId, !currentVal);
    fetchBanks();
  };

  const handleDeleteBank = async (bankId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa Ngân hàng đề thi này?')) {
      await questionBankService.deleteBank(bankId);
      fetchBanks();
    }
  };

  const filteredBanks = React.useMemo(() => {
    let result = banks.filter((b) => {
      if (premiumFilter === 'PREMIUM' && !b.is_premium) return false;
      if (premiumFilter === 'FREE' && b.is_premium) return false;

      if (subjectFilter !== 'ALL') {
        const subName = (b.subject || b.title).toLowerCase();
        if (subjectFilter === 'TOAN' && !subName.includes('toán')) return false;
        if (subjectFilter === 'LY' && !subName.includes('lý') && !subName.includes('vật')) return false;
        if (subjectFilter === 'HOA' && !subName.includes('hóa')) return false;
        if (subjectFilter === 'ANH' && !subName.includes('anh')) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchDesc = b.description?.toLowerCase().includes(q) ?? false;
        const matchSubject = b.subject?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchDesc && !matchSubject) return false;
      }
      return true;
    });

    return [...result].sort((a, b) => {
      if (sortBy === 'COUNT_DESC') return (b.questions_count || 0) - (a.questions_count || 0);
      if (sortBy === 'USED_DESC') return (b.count_used || 0) - (a.count_used || 0);
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
  }, [banks, premiumFilter, subjectFilter, searchQuery, sortBy]);

  const isFiltered = searchQuery.trim() !== '' || premiumFilter !== 'ALL' || subjectFilter !== 'ALL' || sortBy !== 'NEWEST';

  const handleResetFilters = () => {
    setSearchQuery('');
    setPremiumFilter('ALL');
    setSubjectFilter('ALL');
    setSortBy('NEWEST');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border border-purple-100 dark:border-purple-950/60 rounded-3xl bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-transparent">
        <div>
          <Badge variant="purple" className="mb-2">Studio Soạn Đề & Ngân Hàng Câu Hỏi</Badge>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Quản Lý Ngân Hàng Đề Thi Giáo Viên
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Soạn thảo câu hỏi trắc nghiệm động hoặc Import trực tiếp từ file Word (.docx) & Excel (.xlsx).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenImportModal()}
            leftIcon={<DownloadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
          >
            Import File (Word/Excel)
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tạo Ngân Hàng Mới
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar (Expanded Search on Desktop + Subject Filter & Sort) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-sm">
        {/* Search Input with Live Autocomplete Dropdown */}
        <div ref={searchContainerRef} className="relative w-full md:w-96 lg:w-[460px] xl:w-[520px] shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Tìm kiếm ngân hàng đề thi theo tên, môn học, mô tả..."
            value={searchQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            className="pl-10 pr-9 text-xs h-10 rounded-xl focus:ring-purple-500 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Floating Live Autocomplete Dropdown */}
          {isDropdownOpen && searchQuery.trim() !== '' && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>⚡ Gợi ý ngân hàng đề ({searchSuggestions.length})</span>
                <span className="text-purple-600 dark:text-purple-400 font-semibold">Tự động tìm kiếm</span>
              </div>

              {searchSuggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  Không tìm thấy ngân hàng đề nào phù hợp với "{searchQuery}"
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {searchSuggestions.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSelectBank(b.id);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition-colors flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {b.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {b.questions_count ?? 0} câu hỏi • {b.subject || 'Môn Tổng hợp'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {b.is_premium && (
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0.5">⭐ PREMIUM</Badge>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Filter Controls & Sort */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Môn Học Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="ALL">Tất cả môn</option>
              <option value="TOAN">Toán học</option>
              <option value="LY">Vật lý</option>
              <option value="HOA">Hóa học</option>
              <option value="ANH">Tiếng Anh</option>
            </select>
          </div>

          {/* Sắp Xếp Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="NEWEST">Mới nhất</option>
              <option value="COUNT_DESC">Số câu hỏi nhiều nhất</option>
              <option value="USED_DESC">Sử dụng nhiều nhất</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-slate-500 hover:text-purple-600 h-10 px-2.5"
            >
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* Premium / Free Filter Pills & Count */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
        <div className="flex items-center gap-2">
          {[
            { key: 'ALL', label: `Tất cả (${banks.length})` },
            { key: 'PREMIUM', label: '⭐ Trả phí (Marketplace)' },
            { key: 'FREE', label: 'Miễn phí / Nội bộ' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setPremiumFilter(item.key as 'ALL' | 'PREMIUM' | 'FREE')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                premiumFilter === item.key
                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <span className="text-xs font-semibold text-slate-400 shrink-0 hidden sm:inline">
          Đang hiển thị <strong className="text-purple-600 dark:text-purple-400">{filteredBanks.length}</strong> / {banks.length} ngân hàng đề
        </span>
      </div>

      {/* List of Question Banks */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredBanks.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <FileQuestion className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Chưa tìm thấy Ngân hàng đề thi nào
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bấm "Tạo Ngân Hàng Mới" hoặc "Import File" để tải nhanh câu hỏi từ Word / Excel.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanks.map((bank) => (
            <Card
              key={bank.id}
              className="p-5 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-all shadow-sm hover:shadow-md group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant={bank.is_premium ? 'warning' : 'secondary'} className="text-[10px]">
                    {bank.is_premium ? '⭐ PREMIUM (Trả phí)' : 'Miễn Phí'}
                  </Badge>
                  <button
                    onClick={() => handleTogglePremium(bank.id, bank.is_premium)}
                    className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                    title="Bật/Tắt chế độ trả phí (is_premium)"
                  >
                    <Star className={`w-4 h-4 ${bank.is_premium ? 'fill-amber-400 text-amber-500' : ''}`} />
                  </button>
                </div>

                <div>
                  <h3
                    onClick={() => onSelectBank(bank.id)}
                    className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors cursor-pointer line-clamp-2"
                  >
                    {bank.title}
                  </h3>
                  {bank.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{bank.description}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {bank.questions_count ?? bank.questions?.length ?? 0} câu hỏi
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenImportModal(bank.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors text-xs font-semibold flex items-center gap-1"
                    title="Import thêm câu hỏi vào bank này"
                  >
                    <DownloadCloud className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBank(bank.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectBank(bank.id)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Xem Đề
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Tạo Ngân Hàng Đề Thi Mới */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tạo Ngân Hàng Đề Thi Mới
            </h3>

            <form onSubmit={handleCreateBank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Tên Ngân hàng đề thi *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Ôn thi Đại Học môn Toán 12..."
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Mô tả ngắn
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả nội dung phạm vi câu hỏi trong ngân hàng này..."
                  className="w-full p-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is_premium_check"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded text-purple-600"
                />
                <label htmlFor="is_premium_check" className="text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300">
                  Ngân hàng trả phí ⭐ (mở bán trên Marketplace)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Tạo Mới
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
