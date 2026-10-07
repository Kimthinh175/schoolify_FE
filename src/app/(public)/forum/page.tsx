'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  ThumbsUp,
  Eye,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Filter,
  Flame,
  Award,
  BookOpen,
  Pin,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    grade: string;
  };
  subject: string;
  grade: number;
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
  isSolved?: boolean;
  isPinned?: boolean;
  timeAgo: string;
  tags: string[];
}

const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-01',
    title: '[Nội Quy Diễn Đàn] Hướng dẫn đăng câu hỏi và cách gõ công thức Toán/Lý/Hóa bằng LaTeX',
    content:
      'Chào mừng các bạn học sinh đến với Diễn Đàn Học Tập Schoolify! Để câu hỏi của bạn nhận được câu trả lời nhanh nhất, vui lòng kèm ảnh chụp đề bài rõ nét hoặc gõ công thức LaTeX đúng định dạng $...$.',
    author: {
      name: 'Ban Quản Trị Schoolify',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      role: 'Admin Diễn Đàn',
      grade: 'Hệ Thống',
    },
    subject: 'Toán Học',
    grade: 12,
    repliesCount: 48,
    likesCount: 230,
    viewsCount: 1540,
    isSolved: true,
    isPinned: true,
    timeAgo: 'Đã ghim',
    tags: ['Nội quy', 'Hướng dẫn', 'LaTeX'],
  },
  {
    id: 'post-02',
    title: 'Hỏi bài Toán 12: Tìm m để hàm số bậc ba đồng biến trên khoảng $(0; +\\infty)$',
    content:
      'Em đang làm bài tập khảo sát hàm số Chương 1: $y = x^3 - 3mx^2 + 3(2m-1)x + 1$. Thầy cô và các bạn cho em hỏi trường hợp cô lập m hay dùng tam thức bậc hai thì nhanh hơn ạ?',
    author: {
      name: 'Nguyễn Minh Anh',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      role: 'Học sinh',
      grade: 'Lớp 12A1 - THPT Chuyên KHTN',
    },
    subject: 'Toán Học',
    grade: 12,
    repliesCount: 12,
    likesCount: 35,
    viewsCount: 320,
    isSolved: true,
    timeAgo: '15 phút trước',
    tags: ['Đạo hàm', 'Đơn điệu', 'Lớp 12'],
  },
  {
    id: 'post-03',
    title: 'Vật Lý 12: Tính chu kỳ dao động điều hòa của con lắc lò xo khi đặt trong thang máy chuyển động',
    content:
      'Cho con lắc lò xo treo thẳng đứng trong thang máy đang đi lên nhanh dần đều với gia tốc a = 2 m/s^2. Gia tốc trọng trường biểu kiến thay đổi thế nào đến vị trí cân bằng và chu kỳ T?',
    author: {
      name: 'Trần Gia Bảo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      role: 'Học sinh',
      grade: 'Lớp 12 Lý - Lê Hồng Phong',
    },
    subject: 'Vật Lý',
    grade: 12,
    repliesCount: 8,
    likesCount: 19,
    viewsCount: 215,
    isSolved: false,
    timeAgo: '1 giờ trước',
    tags: ['Dao động cơ', 'Lò xo', 'Lớp 12'],
  },
  {
    id: 'post-04',
    title: 'Hóa Học 12: Phương pháp quy đổi este đa chức tạo bởi axit không no và ancol no',
    content:
      'Mọi người có tài liệu hoặc bài giảng nào giải thích cặn kẽ phương pháp đồng đẳng hóa kết hợp dồn chất cho hỗn hợp este phức tạp không ạ? Em làm đề thi thử hay bị rối ở bước tính số mol H2O.',
    author: {
      name: 'Lê Thu Trang',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
      role: 'Học sinh',
      grade: 'Lớp 12 - Chu Văn An',
    },
    subject: 'Hóa Học',
    grade: 12,
    repliesCount: 15,
    likesCount: 42,
    viewsCount: 450,
    isSolved: true,
    timeAgo: '3 giờ trước',
    tags: ['Este - Lipit', 'Đồng đẳng hóa', 'Ôn thi THPT'],
  },
  {
    id: 'post-05',
    title: 'Tiếng Anh 12: Phân biệt cách dùng mệnh đề quan hệ rút gọn bằng V-ing và V-ed',
    content:
      'Trong đề thi có câu: "The students (participating / participated) in the competition must register before Friday." Em hay nhầm lẫn giữa thể chủ động và bị động trong các câu rút gọn dài.',
    author: {
      name: 'Đặng Tuấn Kiệt',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      role: 'Học sinh',
      grade: 'Lớp 11 - Amsterdam',
    },
    subject: 'Tiếng Anh',
    grade: 11,
    repliesCount: 6,
    likesCount: 14,
    viewsCount: 180,
    isSolved: false,
    timeAgo: '5 giờ trước',
    tags: ['Ngữ pháp', 'Rút gọn mệnh đề', 'Lớp 11'],
  },
];

const SUBJECT_FILTERS = ['Tất cả', 'Toán Học', 'Vật Lý', 'Hóa Học', 'Sinh Học', 'Tiếng Anh', 'Ngữ Văn'];

export default function ForumPage() {
  const [selectedSubject, setSelectedSubject] = React.useState('Tất cả');
  const [activeTab, setActiveTab] = React.useState<'ALL' | 'HOT' | 'UNSOLVED' | 'SOLVED'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [newSubject, setNewSubject] = React.useState('Toán Học');
  const [newContent, setNewContent] = React.useState('');
  const [posts, setPosts] = React.useState<ForumPost[]>(MOCK_FORUM_POSTS);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      title: newTitle,
      content: newContent,
      author: {
        name: 'Bạn (Học Sinh)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        role: 'Học sinh',
        grade: 'Lớp 12',
      },
      subject: newSubject,
      grade: 12,
      repliesCount: 0,
      likesCount: 1,
      viewsCount: 5,
      isSolved: false,
      timeAgo: 'Vừa xong',
      tags: [newSubject, 'Hỏi bài'],
    };

    setPosts([newPost, ...posts]);
    setNewTitle('');
    setNewContent('');
    setIsNewPostModalOpen(false);
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSubject =
      selectedSubject === 'Tất cả' || post.subject === selectedSubject;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'HOT') return matchesSubject && matchesSearch && post.likesCount > 20;
    if (activeTab === 'UNSOLVED') return matchesSubject && matchesSearch && !post.isSolved;
    if (activeTab === 'SOLVED') return matchesSubject && matchesSearch && post.isSolved;
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-1">
            CỘNG ĐỒNG HỌC TẬP K-12
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Diễn Đàn Hỏi Đáp &amp; Chia Sẻ Bài Tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Nơi hàng ngàn học sinh và thầy cô cùng trao đổi kiến thức, giải đáp bài tập khó và chia sẻ kinh nghiệm ôn thi 24/7.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => setIsNewPostModalOpen(true)}
          className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold rounded-xl shadow-lg shadow-[#00B8DD]/20 shrink-0 self-start md:self-auto"
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Đặt Câu Hỏi Mới
        </Button>
      </div>

      {/* ── FILTER BARS ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {SUBJECT_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSubject(s)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                selectedSubject === s
                  ? 'bg-[#00B8DD] text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Right Search & Status Tabs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl text-xs w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all',
                activeTab === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setActiveTab('HOT')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1',
                activeTab === 'HOT'
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Flame className="w-3 h-3 text-amber-500" /> Sôi Nổi
            </button>
            <button
              onClick={() => setActiveTab('UNSOLVED')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all',
                activeTab === 'UNSOLVED'
                  ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Chưa Giải
            </button>
            <button
              onClick={() => setActiveTab('SOLVED')}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all',
                activeTab === 'SOLVED'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Đã Giải ✓
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm câu hỏi, dạng bài..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>
        </div>
      </div>

      {/* ── FORUM POSTS & SIDEBAR GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {filteredPosts.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Chưa có câu hỏi nào trong danh mục này
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Hãy là người đầu tiên đặt câu hỏi để nhận sự trợ giúp từ thầy cô và bạn bè!
              </p>
            </Card>
          ) : (
            filteredPosts.map((post, idx) => (
              <motion.div key={post.id} {...fadeUp(idx * 0.04)}>
                <Card
                  className={cn(
                    'p-5 sm:p-6 rounded-2xl border transition-all hover:shadow-md group cursor-pointer bg-white dark:bg-slate-900',
                    post.isPinned
                      ? 'border-[#00B8DD]/50 bg-gradient-to-r from-[#E6F8FC]/30 to-white dark:from-slate-850 dark:to-slate-900'
                      : 'border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/40'
                  )}
                >
                  <div className="space-y-3">
                    {/* Header info */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={post.author.avatar} alt={post.author.name} size="sm" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                              {post.author.name}
                            </h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                              {post.author.grade}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.timeAgo}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {post.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30">
                            <Pin className="w-3 h-3 rotate-45" /> Đã ghim
                          </span>
                        )}
                        {post.isSolved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Đã giải
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Đang chờ giải đáp
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Body */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Tags & Engagement metrics */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD]">
                          {post.subject} • Lớp {post.grade}
                        </span>
                        {post.tags.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1 text-slate-500 hover:text-emerald-600">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 hover:text-[#00B8DD]">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.repliesCount} câu trả lời
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Eye className="w-3.5 h-3.5" />
                          {post.viewsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Right Sidebar Widget (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Helpers Box */}
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Top Thành Viên Tích Cực Tuần Này</span>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Thầy Hoàng Nam', role: 'Giáo viên Toán Chuyên', solves: '45 bài giải', diamonds: '+450 💎' },
                { name: 'Nguyễn Minh Anh', role: 'Lớp 12A1 KHTN', solves: '32 bài giải', diamonds: '+320 💎' },
                { name: 'Trần Gia Bảo', role: 'Lớp 12 Lý', solves: '24 bài giải', diamonds: '+240 💎' },
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800/80 last:border-none">
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200 block">{m.name}</strong>
                    <span className="text-[10px] text-slate-400">{m.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">{m.solves}</span>
                    <span className="text-[10px] text-amber-600 font-bold">{m.diamonds}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Guidelines Box */}
          <Card className="p-5 rounded-2xl border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#E6F8FC]/50 to-white dark:from-slate-850 dark:to-slate-900 space-y-3">
            <div className="flex items-center gap-2 text-[#007D99] dark:text-[#00B8DD] font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Quy Tắc Diễn Đàn Văn Minh</span>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Đặt tiêu đề rõ ràng, nêu rõ dạng bài hoặc công thức trọng tâm.</li>
              <li>Tôn trọng người giải, tích lũy lời cảm ơn và đánh dấu bài đã giải đúng.</li>
              <li>Nghiêm cấm chia sẻ tài liệu vi phạm bản quyền hoặc spam quảng cáo.</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* ── MODAL: ĐẶT CÂU HỎI MỚI ── */}
      <Dialog
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        maxWidth="lg"
        title="Tạo Câu Hỏi Thảo Luận Mới"
        description="Đặt câu hỏi rõ ràng, chi tiết để nhận được câu trả lời chính xác từ cộng đồng."
      >
        <form onSubmit={handleCreatePost} className="space-y-4 py-2 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Tiêu Đề Câu Hỏi:
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ví dụ: Tìm m để hàm số y = x^3 - 3mx^2 + 1 có 2 điểm cực trị thỏa mãn..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Môn Học:
              </label>
              <select
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
              >
                {SUBJECT_FILTERS.filter((s) => s !== 'Tất cả').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Khối Lớp:
              </label>
              <select className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00B8DD]">
                <option value="12">Lớp 12 (Thi THPT)</option>
                <option value="11">Lớp 11</option>
                <option value="10">Lớp 10</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Chi Tiết Bài Tập / Thắc Mắc:
            </label>
            <textarea
              required
              rows={5}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Mô tả cụ thể bước em đang bị vướng hoặc chèn công thức Toán LaTeX..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewPostModalOpen(false)}
              className="rounded-xl border-slate-300 dark:border-slate-700"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 font-bold rounded-xl"
            >
              Đăng Câu Hỏi
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
