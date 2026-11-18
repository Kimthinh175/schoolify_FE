'use client';

import * as React from 'react';
import {
  Trophy,
  Gift,
  Sparkles,
  Award,
  Crown,
  Clock,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { Season, SeasonRewardTier } from '@/types/leaderboard';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeasonRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: Season;
  userRank?: number;
}

export function SeasonRewardsModal({
  isOpen,
  onClose,
  season,
  userRank = 42,
}: SeasonRewardsModalProps) {
  // Find which tier user currently belongs to
  const userCurrentTier = season.rewards.find(
    (t) => userRank >= t.minRank && userRank <= t.maxRank
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cơ Cấu Phần Thưởng Mùa Giải
            </h3>
            <p className="text-xs font-normal text-slate-500">
              {season.name} ({season.code})
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4 my-2 max-h-[70vh] overflow-y-auto pr-1">
        {/* User Current Tier Projection Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#00B8DD]/15 to-purple-500/15 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Phần thưởng dự kiến của bạn (Hạng #{userRank})
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                  {userCurrentTier ? userCurrentTier.tierRank : 'Chứng nhận tham gia'}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Nhận <strong>{userCurrentTier?.gemReward || 100} 💎 Ngọc</strong> + {userCurrentTier?.badgeName || 'Huy hiệu thành viên'}
                </p>
              </div>
            </div>
          </div>
          <Badge variant="warning" className="self-start sm:self-center font-bold px-3 py-1">
            Chốt giải ngày 25/12
          </Badge>
        </div>

        {/* Tiers List */}
        <div className="space-y-2.5">
          {season.rewards.map((tier, idx) => {
            const isFirst = idx === 0;
            const isUserTier = userCurrentTier?.id === tier.id;

            return (
              <div
                key={tier.id}
                className={cn(
                  'p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                  isUserTier
                    ? 'border-[#00B8DD] bg-[#00B8DD]/5 dark:bg-[#00B8DD]/10 ring-2 ring-[#00B8DD]/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0',
                      idx === 0
                        ? 'bg-amber-100 text-amber-700 shadow-sm'
                        : idx === 1
                        ? 'bg-slate-200 text-slate-700'
                        : idx === 2
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${tier.minRank}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {tier.tierRank}
                      </h4>
                      {isUserTier && (
                        <Badge variant="primary" className="text-[10px] py-0 px-1.5 font-bold">
                          Thứ hạng của bạn
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {tier.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap text-[11px]">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        💎 +{tier.gemReward.toLocaleString('vi-VN')} Ngọc
                      </span>
                      <span>•</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        🎖️ {tier.badgeName}
                      </span>
                      {tier.voucherDiscountPct && (
                        <>
                          <span>•</span>
                          <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5">
                            <Ticket className="w-3 h-3" /> Voucher -{tier.voucherDiscountPct}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rules footer */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 space-y-1">
          <p className="font-bold text-slate-700 dark:text-slate-300">
            Thể lệ nhận thưởng:
          </p>
          <p>• Ngọc thưởng sẽ được tự động cộng vào tài khoản học sinh ngay khi mùa giải kết thúc và hoàn tất thẩm định đối soát.</p>
          <p>• Trường hợp nghi vấn gian lận bài thi sẽ bị trừ điểm hoặc loại khỏi danh sách trao giải.</p>
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="secondary" onClick={onClose} size="sm">
          Đóng
        </Button>
      </div>
    </Dialog>
  );
}
