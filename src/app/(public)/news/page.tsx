'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Share2,
  TrendingUp,
  Tag,
  Search,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  featured?: boolean;
  image: string;
  author: string;
}

const MOCK_NEWS: ArticleItem[] = [
  {
    id: 'news-01',
    title: 'Cập nhật cấu trúc đề thi Tốt nghiệp THPT 2026: Phân tích dạng bài trắc nghiệm Đúng/Sai',
    excerpt:
      'Bộ GD&ĐT tiếp tục hoàn thiện định dạng câu hỏi theo Chương trình GDPT 2018. Khám phá bí quyết làm phần trắc nghiệm 4 mệnh đề đúng sai để tối ưu điểm số môn Toán và KHTN.',
    category: 'Thi Tốt Nghiệp THPT',
    date: '04 Tháng 10, 2026',
    readTime: '5 phút đọc',
    featured: true,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    author: 'Ban Khảo Thí Schoolify',
  },
  {
    id: 'news-02',
    title: 'Ma trận tạo đề thích ứng: Giải pháp cá nhân hóa lộ trình học tập cho học sinh lớp 12',
    excerpt:
      'Hệ thống AI của Schoolify tự động phân tích tỷ lệ câu hỏi Nhận biết - Thông hiểu - Vận dụng và liên kết chương trước theo cơ chế Spaced Repetition.',
    category: 'Công Nghệ Giáo Dục',
    date: '02 Tháng 10, 2026',
    readTime: '4 phút đọc',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    author: 'Đội ngũ Kỹ Thuật AI',
  },
  {
    id: 'news-03',
    title: '5 phương pháp giải nhanh bài toán cực trị hình học Oxyz bằng tích có hướng',
    excerpt:
      'Tổng hợp các công thức giải nhanh và mẹo bấm máy tính Casio fx-880BTG cho bài toán tọa độ không gian lớp 12 chuẩn SGK mới.',
    category: 'Bí Quyết Ôn Thi',
    date: '28 Tháng 09, 2026',
    readTime: '7 phút đọc',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    author: 'Thầy Hoàng Nam (GV Toán Chuyên)',
  },
  {
    id: 'news-04',
    title: 'Phát động giải đấu "Đua Top Bảng Vàng Tháng 10" với tổng giải thưởng 10.000 Kim Cương',
    excerpt:
      'Cơ hội tranh tài giữa các cao thủ khối 10, 11, 12 toàn quốc. Top 10 học sinh xuất sắc nhất tháng sẽ nhận phần thưởng hiện vật và voucher học tập giá trị.',
    category: 'Sự Kiện Schoolify',
    date: '25 Tháng 09, 2026',
    readTime: '3 phút đọc',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    author: 'Cộng Đồng Học Sinh Schoolify',
  },
  {
    id: 'news-05',
    title: 'Hướng dẫn sử dụng công cụ gõ công thức Toán học trực quan trên Schoolify',
    excerpt:
      'Trải nghiệm viết bài tự luận môn Toán, Vật Lý, Hóa Học dễ dàng với các phím tắt LaTeX thông minh và bộ công cụ xem trước theo thời gian thực.',
    category: 'Hướng Dẫn Nền Tảng',
    date: '20 Tháng 09, 2026',
    readTime: '4 phút đọc',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
    author: 'Trung Tâm Hỗ Trợ Schoolify',
  },
  {
    id: 'news-06',
    title: 'Nhà trường số hóa: Kinh nghiệm triển khai Schoolify cho hơn 1.500 học sinh tại THPT Chuyên',
    excerpt:
      'Chia sẻ từ Ban Giám Hiệu về việc ứng dụng phân hệ quản lý điểm, tự động phân quyền giáo viên và liên lạc điện tử không giấy tờ với phụ huynh.',
    category: 'Nhà Trường Số',
    date: '15 Tháng 09, 2026',
    readTime: '6 phút đọc',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    author: 'Ban Biên Tập Giáo Dục',
  },
];

const CATEGORIES = [
  'Tất cả',
  'Thi Tốt Nghiệp THPT',
  'Công Nghệ Giáo Dục',
  'Bí Quyết Ôn Thi',
  'Sự Kiện Schoolify',
  'Nhà Trường Số',
];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNews = MOCK_NEWS.filter((article) => {
    const matchesCategory =
      activeCategory === 'Tất cả' || article.category === activeCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = MOCK_NEWS.find((a) => a.featured) || MOCK_NEWS[0];

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
      {/* ── HEADER ── */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <motion.div {...fadeUp(0)}>
          <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-3">
            TIN TỨC &amp; HOẠT ĐỘNG GIÁO DỤC
          </Badge>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Cập Nhật Tri Thức, Đồng Hành Cùng Mùa Thi
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Tin tức mới nhất về kỳ thi tốt nghiệp THPT, thông tư Bộ GD&amp;ĐT, phương pháp học tập thông minh và các sự kiện sôi động tại Schoolify.
          </p>
        </motion.div>
      </div>

      {/* ── SEARCH & CATEGORY FILTER TABS ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer',
                activeCategory === cat
                  ? 'bg-[#00B8DD] text-slate-950 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
          />
        </div>
      </div>

      {/* ── FEATURED HERO ARTICLE ── */}
      {activeCategory === 'Tất cả' && !searchQuery && (
        <motion.div {...fadeUp(0.1)}>
          <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xl hover:shadow-2xl transition-all grid grid-cols-1 lg:grid-cols-12 group cursor-pointer">
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[280px] overflow-hidden">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00B8DD] text-slate-950 shadow-md">
                  Tiêu Điểm Nổi Bật ⭐
                </span>
              </div>
            </div>
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">
                    {featuredArticle.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {featuredArticle.date}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredArticle.readTime}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] group-hover:translate-x-1 transition-transform">
                  Đọc tiếp <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── ARTICLES GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredNews.map((article, idx) => (
          <motion.div key={article.id} {...fadeUp(idx * 0.06)}>
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between h-full hover:shadow-xl hover:border-[#00B8DD]/60 transition-all group cursor-pointer">
              <div>
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-900/80 backdrop-blur-sm text-white border border-white/20">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{article.date}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#007D99] dark:group-hover:text-[#00B8DD] transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="truncate max-w-[150px]">{article.author}</span>
                <span className="font-bold text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
