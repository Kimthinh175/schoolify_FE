'use client';

import * as React from 'react';
import { Trophy, Calendar, Sparkles, Coins, Plus, Trash2 } from 'lucide-react';
import { Season } from '@/types/leaderboard';
import { leaderboardService } from '@/services/leaderboard.service';
import { DEFAULT_SEASON_REWARDS } from '@/services/mock/leaderboard-data';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CreateSeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeasonCreated: (newSeason: Season) => void;
}

export function CreateSeasonModal({
  isOpen,
  onClose,
  onSeasonCreated,
}: CreateSeasonModalProps) {
  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [startDate, setStartDate] = React.useState('2026-02-01');
  const [endDate, setEndDate] = React.useState('2026-05-30');
  const [gemsPool, setGemsPool] = React.useState(350000);
  const [multiplier, setMultiplier] = React.useState(1.2);
  const [rulesText, setRulesText] = React.useState(
    'Mỗi bài thi đạt điểm 9-10: +150 EXP\nDuy trì chuỗi học tập 7 ngày: +200 EXP\nHệ số giờ vàng cuối tuần: 1.5x'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      alert('Vui lòng nhập tên và mã mùa giải');
      return;
    }

    const rules = rulesText
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const created = leaderboardService.createSeason({
      name,
      code: code.toUpperCase(),
      description,
      status: 'UPCOMING',
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      totalGemsPool: gemsPool,
      scoringMultiplier: multiplier,
      rules,
      rewards: DEFAULT_SEASON_REWARDS,
    });

    onSeasonCreated(created);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#00B8DD]/10 text-[#00B8DD]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Tạo Mùa Giải Đua Top Mới
            </h3>
            <p className="text-xs font-normal text-slate-500">
              Thiết lập chu kỳ thi đua, quỹ thưởng Ngọc và hệ số điểm
            </p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 my-2 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Tên Mùa Giải *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Mùa 2: Chiến Binh Tri Thức 2026"
            className="w-full h-10 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Mã Mùa Giải (Code) *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SS-2026-Q2"
              className="w-full h-10 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Quỹ Ngọc Phát Thưởng (💎)
            </label>
            <input
              type="number"
              value={gemsPool}
              onChange={(e) => setGemsPool(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Ngày Bắt Đầu
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Ngày Kết Thúc (Chốt Giải)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Hệ Số Nhân Điểm Thưởng (Scoring Multiplier)
          </label>
          <input
            type="number"
            step="0.05"
            value={multiplier}
            onChange={(e) => setMultiplier(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Mô Tả Mục Tiêu Mùa Giải
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả ý nghĩa, đối tượng học sinh tham gia..."
            className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Quy Tắc Đua Top (Mỗi dòng là một quy tắc)
          </label>
          <textarea
            rows={3}
            value={rulesText}
            onChange={(e) => setRulesText(e.target.value)}
            className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" type="button" onClick={onClose} size="sm">
            Hủy Bỏ
          </Button>
          <Button variant="primary" type="submit" size="sm" className="font-bold">
            Tạo Mùa Giải Ngay
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
