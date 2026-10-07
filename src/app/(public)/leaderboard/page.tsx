'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Gem,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  school: string;
  province: string;
  grade: number;
  streak: number;
  examsCompleted: number;
  points: number;
  diamonds: number;
  badgeTitle: string;
}

const TOP_3_STUDENTS: LeaderboardUser[] = [
  {
    rank: 1,
    name: 'Phan Nhật Minh',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Hà Nội - Amsterdam',
    province: 'Hà Nội',
    grade: 12,
    streak: 42,
    examsCompleted: 156,
    points: 9850,
    diamonds: 1850,
    badgeTitle: 'Đại Cao Thủ K-12 ⭐',
  },
  {
    rank: 2,
    name: 'Trần Thảo Linh',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Lê Hồng Phong',
    province: 'TP. Hồ Chí Minh',
    grade: 12,
    streak: 35,
    examsCompleted: 142,
    points: 9420,
    diamonds: 1620,
    badgeTitle: 'Chiến Thần Tự Luận 🌟',
  },
  {
    rank: 3,
    name: 'Vũ Quốc Khánh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Quốc Học Huế',
    province: 'Thừa Thiên Huế',
    grade: 12,
    streak: 28,
    examsCompleted: 128,
    points: 8960,
    diamonds: 1450,
    badgeTitle: 'Bậc Thầy Giải Tốc Độ ⚡',
  },
];

const LEADERBOARD_LIST: LeaderboardUser[] = [
  {
    rank: 4,
    name: 'Nguyễn Thị Hương',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Lam Sơn',
    province: 'Thanh Hóa',
    grade: 12,
    streak: 24,
    examsCompleted: 110,
    points: 8450,
    diamonds: 1240,
    badgeTitle: 'Tinh Anh Toán Học',
  },
  {
    rank: 5,
    name: 'Lê Hoàng Long',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên KHTN',
    province: 'Hà Nội',
    grade: 12,
    streak: 21,
    examsCompleted: 104,
    points: 8120,
    diamonds: 1180,
    badgeTitle: 'Học Sinh Xuất Sắc',
  },
  {
    rank: 6,
    name: 'Đoàn Bảo Ngọc',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Lương Văn Tụy',
    province: 'Ninh Bình',
    grade: 11,
    streak: 19,
    examsCompleted: 98,
    points: 7890,
    diamonds: 1050,
    badgeTitle: 'Gương Mặt Triển Vọng',
  },
  {
    rank: 7,
    name: 'Đặng Tuấn Tú',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chu Văn An',
    province: 'Hà Nội',
    grade: 12,
    streak: 17,
    examsCompleted: 92,
    points: 7540,
    diamonds: 980,
    badgeTitle: 'Chuyên Cần Kiên Trì',
  },
  {
    rank: 8,
    name: 'Hoàng Kim Chi',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Phan Bội Châu',
    province: 'Nghệ An',
    grade: 12,
    streak: 16,
    examsCompleted: 88,
    points: 7210,
    diamonds: 920,
    badgeTitle: 'Thợ Săn Điểm 10',
  },
  {
    rank: 9,
    name: 'Bùi Đức Anh',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Trần Phú',
    province: 'Hải Phòng',
    grade: 11,
    streak: 14,
    examsCompleted: 82,
    points: 6980,
    diamonds: 850,
    badgeTitle: 'Tài Năng Trẻ',
  },
  {
    rank: 10,
    name: 'Ngô Phương Thảo',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    school: 'THPT Chuyên Bến Tre',
    province: 'Bến Tre',
    grade: 12,
    streak: 12,
    examsCompleted: 76,
    points: 6720,
    diamonds: 800,
    badgeTitle: 'Chinh Phục Điểm 9+',
  },
];

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = React.useState<'WEEK' | 'MONTH' | 'ALL'>('WEEK');
  const [selectedGrade, setSelectedGrade] = React.useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredList = LEADERBOARD_LIST.filter((u) => {
    const matchesGrade = selectedGrade === 'ALL' || u.grade === selectedGrade;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.province.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      {/* ── HEADER ── */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <motion.div {...fadeUp(0)}>
          <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-2">
            VINH DANH HỌC SINH XUẤT SẮC TOÀN QUỐC
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500" />
            <span>BẢNG XẾP HẠNG THI ĐUA</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Mỗi bài thi, câu hỏi trắc nghiệm và tự luận hoàn thành trên Schoolify đều được quy đổi thành điểm kinh nghiệm và Kim Cương 💎 để vinh danh trên Bảng Vàng!
          </p>
        </motion.div>
      </div>

      {/* ── TIMEFRAME & GRADE FILTERS ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        {/* Timeframe Tabs */}
        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl text-xs w-full sm:w-auto">
          {[
            { key: 'WEEK', label: 'Tuần Này' },
            { key: 'MONTH', label: 'Tháng Này' },
            { key: 'ALL', label: 'Toàn Thời Gian' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTimeframe(t.key as any)}
              className={cn(
                'px-4 py-2 rounded-xl font-bold transition-all cursor-pointer',
                timeframe === t.key
                  ? 'bg-white dark:bg-slate-800 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grade Filters & Search */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs">
            {[
              { val: 'ALL', label: 'Tất Cả Khối' },
              { val: 12, label: 'Lớp 12' },
              { val: 11, label: 'Lớp 11' },
              { val: 10, label: 'Lớp 10' },
            ].map((g) => (
              <button
                key={g.val}
                onClick={() => setSelectedGrade(g.val as any)}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer',
                  selectedGrade === g.val
                    ? 'bg-[#00B8DD] text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="relative w-48 sm:w-60 hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, trường..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>
        </div>
      </div>

      {/* ── TOP 3 PODIUM SHOWCASE ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
        {/* TOP 2 (Left) */}
        <motion.div {...fadeUp(0.1)} className="order-2 md:order-1">
          <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center relative overflow-hidden shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 inset-x-0 h-2 bg-slate-400" />
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black mb-3">
              🥈 HẠNG 2 • HUY CHƯƠNG BẠC
            </div>
            <div className="relative mx-auto w-20 h-20 mb-3">
              <Avatar src={TOP_3_STUDENTS[1].avatar} alt={TOP_3_STUDENTS[1].name} size="lg" className="border-4 border-slate-300 shadow-md" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center justify-center shadow">
                2
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {TOP_3_STUDENTS[1].name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {TOP_3_STUDENTS[1].school}
            </p>
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Điểm Tích Lũy</span>
                <strong className="text-slate-900 dark:text-white font-mono font-bold">{TOP_3_STUDENTS[1].points}</strong>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 block">Kim Cương</span>
                <strong className="text-[#007D99] dark:text-[#00B8DD] font-bold">+{TOP_3_STUDENTS[1].diamonds} 💎</strong>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* TOP 1 (Center - Elevated) */}
        <motion.div {...fadeUp(0)} className="order-1 md:order-2">
          <Card className="p-7 rounded-3xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 dark:from-slate-850 dark:via-slate-900 dark:to-slate-850 text-center relative overflow-hidden shadow-2xl scale-105 z-10">
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black shadow-sm mb-3">
              <Crown className="w-4 h-4 text-amber-600 fill-amber-500" />
              QUÁN QUÂN TOÀN QUỐC 🥇
            </div>
            <div className="relative mx-auto w-24 h-24 mb-3">
              <Avatar src={TOP_3_STUDENTS[0].avatar} alt={TOP_3_STUDENTS[0].name} size="lg" className="w-24 h-24 border-4 border-amber-400 shadow-xl" />
              <span className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg border-2 border-white">
                1
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {TOP_3_STUDENTS[0].name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {TOP_3_STUDENTS[0].school} • {TOP_3_STUDENTS[0].province}
            </p>
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-100/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-semibold">Điểm Tích Lũy</span>
                <strong className="text-slate-950 dark:text-white font-mono font-black text-sm">{TOP_3_STUDENTS[0].points}</strong>
              </div>
              <div className="h-7 w-px bg-amber-300 dark:bg-amber-800" />
              <div>
                <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-semibold">Kim Cương Thưởng</span>
                <strong className="text-[#007D99] dark:text-[#00B8DD] font-black text-sm">+{TOP_3_STUDENTS[0].diamonds} 💎</strong>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* TOP 3 (Right) */}
        <motion.div {...fadeUp(0.15)} className="order-3">
          <Card className="p-6 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center relative overflow-hidden shadow-lg hover:shadow-xl transition-all">
            <div className="absolute top-0 inset-x-0 h-2 bg-amber-700" />
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-black mb-3">
              🥉 HẠNG 3 • HUY CHƯƠNG ĐỒNG
            </div>
            <div className="relative mx-auto w-20 h-20 mb-3">
              <Avatar src={TOP_3_STUDENTS[2].avatar} alt={TOP_3_STUDENTS[2].name} size="lg" className="border-4 border-amber-600/70 shadow-md" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow">
                3
              </span>
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {TOP_3_STUDENTS[2].name}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {TOP_3_STUDENTS[2].school}
            </p>
            <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-around text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Điểm Tích Lũy</span>
                <strong className="text-slate-900 dark:text-white font-mono font-bold">{TOP_3_STUDENTS[2].points}</strong>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 block">Kim Cương</span>
                <strong className="text-[#007D99] dark:text-[#00B8DD] font-bold">+{TOP_3_STUDENTS[2].diamonds} 💎</strong>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── LEADERBOARD TABLE (TOP 4 TO 10) ── */}
      <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5 text-[#00B8DD]" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Bảng Xếp Hạng Chi Tiết (Top 4 - Top 10)
            </h3>
          </div>
          <span className="text-xs text-slate-500">Cập nhật tự động sau mỗi bài thi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4 text-center w-16">Thứ Hạng</th>
                <th className="py-3.5 px-4">Học Sinh</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Trường &amp; Tỉnh Thành</th>
                <th className="py-3.5 px-4 text-center">Chuỗi Ngày 🔥</th>
                <th className="py-3.5 px-4 text-center hidden md:table-cell">Đề Đã Luyện</th>
                <th className="py-3.5 px-4 text-right">Kim Cương 💎</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.map((user) => (
                <tr key={user.rank} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-700 dark:text-slate-300">
                      #{user.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} alt={user.name} size="sm" />
                      <div>
                        <strong className="text-slate-900 dark:text-white block font-bold">
                          {user.name}
                        </strong>
                        <span className="text-[11px] text-[#007D99] dark:text-[#00B8DD] font-semibold">
                          {user.badgeTitle} • Lớp {user.grade}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 hidden sm:table-cell text-slate-600 dark:text-slate-400 text-xs">
                    <div>{user.school}</div>
                    <span className="text-[10px] text-slate-400">{user.province}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-500">
                    {user.streak} ngày
                  </td>
                  <td className="py-3.5 px-4 text-center hidden md:table-cell text-slate-500">
                    {user.examsCompleted} đề thi
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-[#007D99] dark:text-[#00B8DD] font-mono">
                    +{user.diamonds}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── CALL TO ACTION STRIP ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#E6F8FC] via-white to-sky-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-[#00B8DD]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Bạn Muốn Ghi Tên Lên Bảng Vàng Schoolify?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Luyện ngay một đề thi hôm nay để tích lũy điểm số và thăng hạng liên tục!
          </p>
        </div>
        <Link href="/#kho-mon-hoc">
          <Button className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold rounded-xl shadow-md shrink-0" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Bắt Đầu Luyện Ngay
          </Button>
        </Link>
      </div>
    </div>
  );
}
