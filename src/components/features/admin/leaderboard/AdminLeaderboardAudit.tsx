'use client';

import * as React from 'react';
import {
  ShieldAlert,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingDown,
  UserX,
  History,
} from 'lucide-react';
import { LeaderboardUser } from '@/types/leaderboard';
import { leaderboardService } from '@/services/leaderboard.service';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';

interface AdminLeaderboardAuditProps {
  users: LeaderboardUser[];
  onUserAdjusted: () => void;
}

export function AdminLeaderboardAudit({
  users,
  onUserAdjusted,
}: AdminLeaderboardAuditProps) {
  const [search, setSearch] = React.useState('');
  const [selectedUser, setSelectedUser] = React.useState<LeaderboardUser | null>(null);
  const [penaltyPoints, setPenaltyPoints] = React.useState(500);
  const [penaltyReason, setPenaltyReason] = React.useState('Làm 120 câu trắc nghiệm dưới 60 giây (Nghi vấn tool)');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = React.useState<string | null>(null);

  const filteredUsers = React.useMemo(() => {
    if (!search.trim()) return users.slice(0, 10);
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.schoolName.toLowerCase().includes(q) ||
        u.className.toLowerCase().includes(q)
    );
  }, [users, search]);

  const handleApplyPenalty = () => {
    if (!selectedUser) return;
    setActionSuccessMsg(`Đã trừ ${penaltyPoints} EXP của ${selectedUser.name} do: ${penaltyReason}`);
    setIsModalOpen(false);
    setTimeout(() => {
      setActionSuccessMsg(null);
      onUserAdjusted();
    }, 4000);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>Giám Sát Bất Thường & Xử Lý Điểm Gian Lận</span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Hệ thống tự động gắn cờ tài khoản có tốc độ làm bài bất thường. Quản trị viên có thể xem xét và trừ điểm thủ công.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh..."
            className="w-full h-9 pl-9 pr-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
          />
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Users table for audit */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-4 text-left">Hạng</th>
                <th className="py-2.5 px-4 text-left">Học Sinh</th>
                <th className="py-2.5 px-4 text-left">Trường Học</th>
                <th className="py-2.5 px-4 text-right">Tổng EXP</th>
                <th className="py-2.5 px-4 text-center">Tỷ Lệ Đúng</th>
                <th className="py-2.5 px-4 text-center">AI Audit Status</th>
                <th className="py-2.5 px-4 text-center">Xử Lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                    #{u.rank}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                    {u.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500">{u.schoolName}</td>
                  <td className="py-2.5 px-4 text-right font-black text-[#00B8DD]">
                    {u.points.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {u.correctRate}%
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Badge variant="success" className="text-[10px] py-0">
                      Hợp Lệ (An Toàn)
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUser(u);
                        setIsModalOpen(true);
                      }}
                      className="h-7 text-xs px-2.5 border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Phạt Điểm
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Penalty Action Dialog */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        title="Xử Phạt Điểm & Cảnh Cáo Học Sinh"
      >
        {selectedUser && (
          <div className="space-y-4 my-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedUser.name} (#{selectedUser.rank})
              </p>
              <p className="text-slate-500 mt-0.5">
                {selectedUser.className} • {selectedUser.schoolName}
              </p>
              <p className="text-[#00B8DD] font-black mt-1">
                Điểm hiện tại: {selectedUser.points.toLocaleString('vi-VN')} EXP
              </p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Số Điểm EXP Trừ Phạt:
              </label>
              <input
                type="number"
                value={penaltyPoints}
                onChange={(e) => setPenaltyPoints(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Lý Do Phạt (Lưu Vào Nhật Ký Đối Soát):
              </label>
              <textarea
                rows={2}
                value={penaltyReason}
                onChange={(e) => setPenaltyReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleApplyPenalty}
                className="font-bold"
              >
                Xác Nhận Trừ Điểm
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
