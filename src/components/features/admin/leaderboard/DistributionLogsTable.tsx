'use client';

import * as React from 'react';
import {
  FileText,
  CheckCircle2,
  Calendar,
  User,
  Coins,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SeasonDistributionLog } from '@/types/leaderboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DistributionLogsTableProps {
  logs: SeasonDistributionLog[];
}

export function DistributionLogsTable({ logs }: DistributionLogsTableProps) {
  const [selectedLog, setSelectedLog] = React.useState<SeasonDistributionLog | null>(null);

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        Chưa có biên bản phát thưởng nào được ghi nhận.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 text-left">Mùa Giải & Mã</th>
                <th className="py-3 px-4 text-left">Thời Điểm Chốt</th>
                <th className="py-3 px-4 text-left">Người Duyệt Phát</th>
                <th className="py-3 px-4 text-center">Số Lượng Nhận</th>
                <th className="py-3 px-4 text-right">Tổng Ngọc Đã Phát</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {log.seasonName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.seasonCode}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    {new Date(log.settledAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                      {log.adminName}
                    </span>
                    <span className="text-[10px] text-slate-400">{log.adminEmail}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                    {log.totalRecipients} học sinh
                  </td>
                  <td className="py-3 px-4 text-right font-black text-cyan-600 dark:text-cyan-400">
                    💎 {log.totalGemsDistributed.toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success" className="text-[10px] py-0 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Thành Công</span>
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedLog(log)}
                      className="h-8 px-2.5 text-xs text-[#00B8DD]"
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slideout / Modal */}
      {selectedLog && (
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Biên Bản Đối Soát #{selectedLog.id}
              </h4>
              <p className="text-slate-500 text-[11px]">{selectedLog.seasonName}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setSelectedLog(null)} className="h-7 text-xs">
              Đóng
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-slate-400 font-semibold block">Top 3 Thí Sinh Nhận Giải:</span>
              <ul className="mt-1 space-y-1">
                {selectedLog.topWinners.map((w) => (
                  <li key={w.rank} className="font-medium text-slate-800 dark:text-slate-200">
                    #{w.rank} {w.userName} - <strong>+{w.gemsAwarded} 💎</strong> ({w.badge})
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 font-semibold block">Ghi Chú Kiểm Tra Gian Lận:</span>
              <p className="mt-1 text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                &ldquo;{selectedLog.auditNotes || 'Không có ghi chú bất thường.'}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
