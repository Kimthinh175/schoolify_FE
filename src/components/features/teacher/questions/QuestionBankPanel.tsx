'use client';

import * as React from 'react';
import { Library, Plus, Trash2, Crown, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { QuestionBank } from '@/types';
import { SearchField } from './SearchField';
import { FilterDropdown, FilterOption } from './FilterDropdown';

type PremiumFilter = 'ALL' | 'PREMIUM' | 'FREE';

export function QuestionBankPanel({
  banks,
  selectedBankId,
  onSelect,
  onTogglePremium,
  onOpenCreate,
  onDelete,
}: {
  banks: QuestionBank[];
  selectedBankId: string | null;
  onSelect: (id: string) => void;
  onTogglePremium: (bank: QuestionBank, value: boolean) => void;
  onOpenCreate: () => void;
  onDelete: (bankId: string) => void;
}) {
  const [query, setQuery] = React.useState('');
  const [premiumFilter, setPremiumFilter] = React.useState<PremiumFilter>('ALL');

  const premiumOptions: FilterOption[] = [
    { value: 'ALL', label: 'Tất cả', count: banks.length },
    { value: 'PREMIUM', label: 'Premium', count: banks.filter((b) => b.is_premium).length },
    { value: 'FREE', label: 'Thường', count: banks.filter((b) => !b.is_premium).length },
  ];

  const filteredBanks = banks.filter((bank) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q || bank.title.toLowerCase().includes(q) || (bank.subject || '').toLowerCase().includes(q);
    const matchPremium =
      premiumFilter === 'ALL' || (premiumFilter === 'PREMIUM' ? bank.is_premium : !bank.is_premium);
    return matchQuery && matchPremium;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Ngân Hàng Đề</h2>
        </div>
        <Button size="sm" onClick={onOpenCreate} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Tạo
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="sm:flex-1 sm:min-w-0">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Tìm theo tên hoặc môn học..."
          />
        </div>
        <div className="sm:shrink-0">
          <FilterDropdown
            value={premiumFilter}
            options={premiumOptions}
            onChange={(v) => setPremiumFilter(v as PremiumFilter)}
          />
        </div>
      </div>

      {banks.length > 0 && (
        <p className="text-[11px] text-slate-400">
          Hiển thị{' '}
          <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredBanks.length}</span>
          /{banks.length} ngân hàng đề
        </p>
      )}

      <div className="space-y-2">
        {banks.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">Chưa có ngân hàng đề nào.</p>
        )}
        {banks.length > 0 && filteredBanks.length === 0 && (
          <p className="text-xs text-slate-400 py-6 text-center">Không tìm thấy ngân hàng đề phù hợp.</p>
        )}
        {filteredBanks.map((bank) => (
          <div
            key={bank.id}
            onClick={() => onSelect(bank.id)}
            className={cn(
              'rounded-xl border p-3 cursor-pointer transition-all',
              selectedBankId === bank.id
                ? 'border-[#00B8DD] ring-1 ring-[#00B8DD]/40 bg-[#E6F8FC]/60 dark:bg-[#00B8DD]/10'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{bank.title}</p>
                <p className="text-[11px] text-slate-500">
                  {bank.subject || 'Chưa phân môn'} • {bank.questions_count ?? bank.questions?.length ?? 0} câu
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bank.id);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer shrink-0"
                aria-label="Xoá ngân hàng"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {bank.description && (
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                {bank.description}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" /> Đã dùng: {bank.count_used ?? 0} lượt
              </span>
            </div>

            <div
              className="mt-2.5 flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <Crown className={cn('w-3.5 h-3.5', bank.is_premium ? 'text-amber-500' : 'text-slate-400')} />
                Premium
              </span>
              <Switch
                size="sm"
                checked={bank.is_premium}
                onCheckedChange={(v) => onTogglePremium(bank, v)}
                aria-label={`Bật/tắt Premium cho ${bank.title}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
