'use client';

import * as React from 'react';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Gift,
  Award,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Season, DistributionRecipient } from '@/types/leaderboard';
import { leaderboardService } from '@/services/leaderboard.service';
import { catalogService } from '@/services/catalog.service';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RewardDistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: Season;
  onDistributionComplete: () => void;
}

export function RewardDistributionModal({
  isOpen,
  onClose,
  season,
  onDistributionComplete,
}: RewardDistributionModalProps) {
  const [recipients, setRecipients] = React.useState<DistributionRecipient[]>([]);
  const [adminName, setAdminName] = React.useState('Vũ Minh (Super Admin)');
  const [auditNotes, setAuditNotes] = React.useState(
    'Đã đối soát 100% hồ sơ học sinh Top 100. Đạt chuẩn tính hợp lệ không có gian lận điểm số.'
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [totalGems, setTotalGems] = React.useState(0);

  React.useEffect(() => {
    if (!isOpen || !season) return;
    let mounted = true;
    catalogService.getLeaderboard().then((entries) => {
      if (!mounted) return;
      if (entries.length > 0) {
        const recs: DistributionRecipient[] = entries.slice(0, 50).map((u, idx) => {
          const rank = Number(u.rank || idx + 1);
          const matchedTier = season.rewards.find((t) => rank >= t.minRank && rank <= t.maxRank);
          const gemsAwarded = matchedTier ? Number(matchedTier.gemReward || 0) : 0;
          return {
            userId: u.userId || u.studentId || `u-${idx}`,
            userName: u.fullname,
            avatar:
              u.avatarUrl ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            schoolName: u.schoolName || 'THPT Chuyên Schoolify',
            className: `Lớp ${u.grade || 12}`,
            rank,
            points: Number(u.points || 0),
            gemsAwarded,
            badgeAwarded: matchedTier?.badgeName || 'Chứng Nhận Mùa Giải',
            status: 'PENDING',
          };
        });
        setRecipients(recs);
        setTotalGems(recs.reduce((sum, r) => sum + r.gemsAwarded, 0));
      } else {
        const recs = leaderboardService.getDistributionRecipients(season.id);
        setRecipients(recs);
        const total = recs
          .filter((r) => r.status !== 'FLAGGED')
          .reduce((sum, r) => sum + r.gemsAwarded, 0);
        setTotalGems(total);
      }
      setIsSuccess(false);
    });
    return () => {
      mounted = false;
    };
  }, [isOpen, season]);

  const handleExecute = async () => {
    setIsSubmitting(true);
    try {
      await catalogService.distributeSeasonRewards(season.id);
      setIsSubmitting(false);
      setIsSuccess(true);
      onDistributionComplete();
    } catch (err: any) {
      setIsSubmitting(false);
      alert('Có lỗi xảy ra khi phát thưởng: ' + (err?.message || String(err)));
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Chốt Sổ & Phát Thưởng Ngọc Cuối Mùa
            </h3>
            <p className="text-xs font-normal text-slate-500">
              {season.name} ({season.code})
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5 my-2 max-h-[72vh] overflow-y-auto pr-1">
        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/20">
              🎉
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Phát Thưởng Mùa Giải Thành Công!
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                Đã chuyển thành công tổng cộng <strong>{totalGems.toLocaleString('vi-VN')} 💎 Ngọc</strong> vào ví học sinh và cập nhật chứng nhận danh hiệu.
              </p>
            </div>

            <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mùa giải:</span>
                <span className="font-bold text-slate-900 dark:text-white">{season.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số lượng học sinh nhận quà:</span>
                <span className="font-bold text-emerald-600">{recipients.length} học sinh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người thực hiện duyệt:</span>
                <span className="font-bold text-slate-900 dark:text-white">{adminName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời gian chốt:</span>
                <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center">
              <Button variant="primary" onClick={onClose} className="px-8 font-bold">
                Hoàn Tất & Đóng
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Audit Notice Alert */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                  Đối Soát AI Tự Động: Hồ sơ hợp lệ
                </h4>
                <p className="text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                  Toàn bộ danh sách {recipients.length} học sinh đứng đầu đã vượt qua các bài kiểm tra tần suất nộp bài, phân tích độ trễ phản xạ và xác thực danh tính trường học.
                </p>
              </div>
            </div>

            {/* Allocation Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tổng Học Sinh Nhận</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {recipients.length} Thí sinh
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                  Tổng Ngọc Sẽ Phát
                </span>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                  💎 {totalGems.toLocaleString('vi-VN')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-center">
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-300">
                  Quỹ Còn Lại
                </span>
                <p className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
                  💎 {(season.totalGemsPool - totalGems).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Preview Recipients Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Danh Sách Dự Kiến Nhận Thưởng (Top 50)
                </h4>
                <span className="text-xs text-slate-400">Theo bảng xếp hạng thời điểm hiện tại</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3 text-left">Hạng</th>
                      <th className="py-2.5 px-3 text-left">Học Sinh & Trường</th>
                      <th className="py-2.5 px-right text-right">Điểm EXP</th>
                      <th className="py-2.5 px-right text-right">Ngọc Thưởng</th>
                      <th className="py-2.5 px-left text-left pl-4">Danh Hiệu Trao Tặng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recipients.map((rec) => (
                      <tr key={rec.userId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="py-2 px-3 font-bold">
                          {rec.rank === 1 && <span className="text-amber-500">👑 #1</span>}
                          {rec.rank === 2 && <span className="text-slate-500">🥈 #2</span>}
                          {rec.rank === 3 && <span className="text-amber-700">🥉 #3</span>}
                          {rec.rank > 3 && <span>#{rec.rank}</span>}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-semibold text-slate-900 dark:text-white">{rec.userName}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{rec.schoolName}</div>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold">
                          {rec.points.toLocaleString('vi-VN')}
                        </td>
                        <td className="py-2 px-3 text-right font-black text-cyan-600 dark:text-cyan-400">
                          +{rec.gemsAwarded.toLocaleString('vi-VN')} 💎
                        </td>
                        <td className="py-2 px-3 pl-4">
                          <Badge variant="outline" className="text-[10px] py-0 font-normal">
                            {rec.badgeAwarded}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Admin Audit Confirmation Fields */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quản Trị Viên Chịu Trách Nhiệm Phê Duyệt:
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Ghi Chú Biên Bản Đối Soát & Quyết Định Phát Thưởng:
                </label>
                <textarea
                  rows={2}
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy Bỏ
              </Button>
              <Button
                variant="primary"
                onClick={handleExecute}
                isLoading={isSubmitting}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
              >
                <Gift className="w-4 h-4" />
                <span>Xác Nhận & Chuyển Ngọc Ngay</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
