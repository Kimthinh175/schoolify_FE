'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Play,
  ArrowRight,
  BookOpen,
  Award,
  Flame,
  Trophy,
  Crown,
  CheckCircle2,
  Lock,
  Star,
  Clock,
  Phone,
  Mail,
  MapPin,
  Send,
  HelpCircle,
  BarChart3,
  Gift,
  Zap,
  TrendingUp,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Landmark,
  Globe,
  Scale,
  Cpu,
  Wrench,
  Languages,
  ChevronRight,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { K12_SUBJECTS } from '@/services/mock/data';
import { K12Subject } from '@/types/subject';
import { LevelSelectionModal } from '@/components/features/student/practice/LevelSelectionModal';
import { RequireLoginModal, RequireLoginReason } from '@/components/features/auth/RequireLoginModal';
import { cn } from '@/lib/utils';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

// Helper icon mapping for K-12 subjects
const SUBJECT_ICON_MAP: Record<string, React.ReactNode> = {
  Calculator: <Calculator className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Languages: <Languages className="w-6 h-6" />,
  Atom: <Atom className="w-6 h-6" />,
  FlaskConical: <FlaskConical className="w-6 h-6" />,
  Dna: <Dna className="w-6 h-6" />,
  Landmark: <Landmark className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Scale: <Scale className="w-6 h-6" />,
  Cpu: <Cpu className="w-6 h-6" />,
  Wrench: <Wrench className="w-6 h-6" />,
};

const PRACTICE_LEVELS_SHOWCASE = [
  {
    level: '1. CƠ BẢN',
    name: 'Nắm Chắc Kiến Thức SGK',
    desc: 'Hệ thống hóa 100% lý thuyết, định lý và dạng bài tập cơ bản trong Sách giáo khoa chuẩn Bộ GD&ĐT.',
    badge: 'Miễn Phí • Không Cần Login',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: BookOpen,
    iconColor: 'text-emerald-500',
    reward: '+10 💎',
    isFree: true,
  },
  {
    level: '2. TRUNG BÌNH',
    name: 'Rèn Phản Xạ Bài Thi Học Kỳ',
    desc: 'Các dạng bài thông hiểu và vận dụng vừa sức, bám sát đề thi giữa kỳ, học kỳ và cấu trúc thi Tốt nghiệp THPT.',
    badge: 'Học Kỳ & Tốt Nghiệp',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    icon: Award,
    iconColor: 'text-sky-500',
    reward: '+20 💎',
    isFree: true,
  },
  {
    level: '3. NÂNG CAO',
    name: 'Vận Dụng Cao Lấy Điểm 9 - 10',
    desc: 'Bộ câu hỏi phân loại đòi hỏi tư duy logic, kỹ thuật giải nhanh trắc nghiệm và xử lý các bẫy đề thi.',
    badge: 'Cần Đăng Nhập',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: Flame,
    iconColor: 'text-purple-500',
    reward: '+50 💎',
    isFree: false,
  },
  {
    level: '4. HSG TỈNH',
    name: 'Đề Thi Tuyển Chọn Tỉnh & TP',
    desc: 'Tổng hợp đề thi chọn Học sinh giỏi cấp Tỉnh/Thành phố của Hà Nội, TP.HCM, Nam Định, Nghệ An...',
    badge: 'Cần Đăng Nhập',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Trophy,
    iconColor: 'text-amber-500',
    reward: '+100 💎',
    isFree: false,
  },
  {
    level: '5. HSG QUỐC GIA',
    name: 'Chuyên Đề Olympic & Đội Tuyển',
    desc: 'Đỉnh cao học sinh giỏi với các chuyên đề Olympic, vòng chọn đội tuyển và đề thi HSG Quốc gia chính thức.',
    badge: 'Cần Đăng Nhập',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: Crown,
    iconColor: 'text-rose-500',
    reward: '+200 💎',
    isFree: false,
  },
];

const FOUR_STEP_WORKFLOW = [
  {
    step: '01',
    title: 'Tóm Tắt Lý Thuyết Cốt Lõi',
    desc: 'Flashcard định nghĩa, sơ đồ tư duy và bảng công thức then chốt giúp ôn lại kiến thức chỉ trong 3-5 phút.',
    icon: BookOpen,
    tag: 'Ghi Nhớ Nhanh',
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    step: '02',
    title: 'Trắc Nghiệm Tương Tác',
    desc: 'Chấm điểm tức thì sau mỗi câu, đồng hồ bấm giờ áp lực thi thật và giải thích chi tiết phương pháp làm bài.',
    icon: Zap,
    tag: 'Phản Xạ Nhanh',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    step: '03',
    title: 'Tự Luận Chuyên Sâu',
    desc: 'Khung soạn thảo lời giải hoàn chỉnh, đối chiếu barem điểm chi tiết của từng bước biến đổi chuẩn khảo thí.',
    icon: Award,
    tag: 'Barem Chuẩn',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
  },
  {
    step: '04',
    title: 'Bài Khảo Thí & Xếp Hạng',
    desc: 'Đề thi tổng hợp tính điểm chuẩn xác, cập nhật vào Bảng vàng thi đua và cộng thưởng kim cương 💎 vào ví.',
    icon: Trophy,
    tag: 'Đua Top Điểm',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
];

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: 'Trần Hoàng Nam', school: 'THPT Chuyên Hà Nội - Amsterdam', points: 1250, badge: '🥇 Quán Quân Tuần' },
  { rank: 2, name: 'Nguyễn Hoàng Minh', school: 'THPT Chuyên Công Nghệ Schoolify', points: 980, badge: '🥈 Á Quân' },
  { rank: 3, name: 'Lê Thu Thảo', school: 'THPT Chuyên Lê Hồng Phong (TP.HCM)', points: 920, badge: '🥉 Top 3' },
];

export default function LandingPage() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [contactSubmitted, setContactSubmitted] = React.useState(false);

  // Practice Subjects State
  const [activeCategory, setActiveCategory] = React.useState('ALL');
  const [selectedSubject, setSelectedSubject] = React.useState<K12Subject | null>(null);
  const [isLevelModalOpen, setIsLevelModalOpen] = React.useState(false);

  // Require Login Modal State
  const [requireLoginOpen, setRequireLoginOpen] = React.useState(false);
  const [loginReason, setLoginReason] = React.useState<RequireLoginReason>('GENERAL');
  const [targetLevelName, setTargetLevelName] = React.useState<string>('');

  const categoryTabs = [
    { id: 'ALL', label: 'Tất Cả Môn K-12', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'NATURAL', label: 'Khoa Học Tự Nhiên', icon: <Atom className="w-3.5 h-3.5 text-emerald-500" /> },
    { id: 'SOCIAL', label: 'Khoa Học Xã Hội', icon: <BookOpen className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'LANGUAGE', label: 'Ngoại Ngữ', icon: <Languages className="w-3.5 h-3.5 text-sky-500" /> },
    { id: 'TECH', label: 'Tin Học & Kỹ Thuật', icon: <Cpu className="w-3.5 h-3.5 text-indigo-500" /> },
  ];

  const filteredSubjects = React.useMemo(() => {
    // Bỏ qua môn văn theo yêu cầu luyện thi trắc nghiệm & khảo thí
    const availableSubjects = K12_SUBJECTS.filter((s) => s.slug !== 'ngu-van');
    if (activeCategory === 'ALL') return availableSubjects;
    return availableSubjects.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  const handleOpenSubjectLevels = (subject: K12Subject) => {
    setSelectedSubject(subject);
    setIsLevelModalOpen(true);
  };

  const handleLevelCardClick = (levelItem: (typeof PRACTICE_LEVELS_SHOWCASE)[0]) => {
    if (levelItem.isFree) {
      // Pick first subject (Toán) and open practice
      const defaultSubject = K12_SUBJECTS[0];
      setSelectedSubject(defaultSubject);
      setIsLevelModalOpen(true);
    } else {
      setTargetLevelName(levelItem.name);
      setLoginReason('ADVANCED_LEVEL');
      setRequireLoginOpen(true);
    }
  };

  const handleLeaderboardClick = () => {
    setLoginReason('LEADERBOARD');
    setRequireLoginOpen(true);
  };

  const handleStoreClick = () => {
    setLoginReason('STORE');
    setRequireLoginOpen(true);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn('Video playback notice:', err?.message || err);
              setIsPlaying(false);
            });
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-[#00B8DD]/20 selection:text-slate-900">
      {/* ──────────────────────────────────────────────────────────── */}
      {/* KHO MÔN HỌC LUYỆN THI K-12 (TÂM ĐIỂM TRANG CHỦ)              */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="kho-mon-hoc" className="pt-6 sm:pt-10 pb-12 sm:pb-16 bg-slate-50/70 border-b border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Section Header Block */}
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#00B8DD]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#007D99]">
                Tâm Điểm Luyện Thi K-12 Schoolify
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tất Cả Môn Học K-12 Sẵn Sàng Để Luyện Tập
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Chọn bất kỳ môn học nào bên dưới để vào làm bài. Mức <strong>Cơ bản</strong> mở tự do cho mọi học sinh làm thử không cần đăng nhập!
            </p>
          </div>

          {/* Category Filter Tabs (Moved below title) */}
          <div className="overflow-x-auto no-scrollbar pt-1 pb-1">
            <Tabs
              tabs={categoryTabs}
              activeTab={activeCategory}
              onChange={setActiveCategory}
              className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs"
            />
          </div>

          {/* Subjects Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredSubjects.map((subject) => {
              const icon = SUBJECT_ICON_MAP[subject.iconName] || <BookOpen className="w-6 h-6" />;
              return (
                <Card
                  key={subject.id}
                  onClick={() => handleOpenSubjectLevels(subject)}
                  className="group p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-slate-200/90 bg-white cursor-pointer flex flex-col justify-between rounded-2xl relative overflow-hidden"
                >
                  {/* Free trial ribbon badge on top */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        'p-3 rounded-2xl transition-transform group-hover:scale-110 duration-300',
                        subject.bgLight,
                        subject.themeColor
                      )}
                    >
                      {icon}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Luyện Thử Free
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00B8DD] transition-colors line-clamp-1">
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {subject.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#00B8DD]" />
                        <strong>5</strong> cấp độ
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                        <strong>{subject.totalExams.toLocaleString()}</strong> đề thi
                      </span>
                    </div>

                    {/* Levels Pills */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                        Cơ bản (Free)
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        Trung bình
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> +3 HSG
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-end text-xs font-bold text-[#007D99] group-hover:text-[#00B8DD] group-hover:translate-x-1 transition-all">
                      <span>Vào Luyện Thử</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 3. SECTION: VIDEO BANNER GIỚI THIỆU 30S                      */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section id="video-gioi-thieu" className="py-14 sm:py-20 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div>
            <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-3">
              VIDEO TRẢI NGHIỆM 30 GIÂY
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Khám Phá Phòng Luyện Thi Thông Minh Schoolify
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Trực quan thao tác làm bài trắc nghiệm, bấm giờ đếm ngược, khung soạn thảo tự luận và hệ thống chấm điểm tích kim cương 💎.
            </p>
          </div>

          {/* Video Container */}
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 shadow-2xl shadow-[#00B8DD]/20 border-2 sm:border-4 border-white ring-1 ring-slate-200/80 group">
            <video
              ref={videoRef}
              poster="/banner.png"
              controls
              playsInline
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                type="video/mp4"
              />
              Trình duyệt của bạn không hỗ trợ thẻ video HTML5.
            </video>

            {/* Custom Overlay Play Button */}
            {!isPlaying && (
              <div
                onClick={handlePlayVideo}
                className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer transition-opacity group-hover:bg-black/45"
              >
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-[#00B8DD] hover:bg-[#009bbd] text-slate-950 flex items-center justify-center shadow-2xl shadow-[#00B8DD]/60 transform group-hover:scale-110 transition-transform duration-200 border-2 border-white/50">
                  <Play className="w-8 h-8 fill-slate-950 ml-1" />
                </div>
                <p className="text-white text-xs sm:text-sm font-black mt-3 tracking-wide drop-shadow-md">
                  Xem Video Nền Tảng (30 Giây)
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 4. SECTION: THANG 5 CẤP ĐỘ MỤC TIÊU (THE 5-LEVEL MASTERY)    */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <motion.div {...fadeUp(0)}>
              <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-3">
                LỘ TRÌNH PHÂN HÓA NĂNG LỰC
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Thang 5 Cấp Độ: Học Sinh Nào Cũng Có Mục Tiêu Riêng
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
                Từ lấy lại gốc kiến thức đến chinh phục giải Nhất Quốc Gia. Học sinh có thể bắt đầu với cấp độ Cơ bản ngay hôm nay.
              </p>
            </motion.div>
          </div>

          {/* 5 Levels Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRACTICE_LEVELS_SHOWCASE.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.level} {...fadeUp(idx * 0.08)}>
                  <Card
                    onClick={() => handleLevelCardClick(item)}
                    className="h-full p-6 border-slate-200/90 hover:border-[#00B8DD] hover:shadow-xl transition-all duration-300 bg-white flex flex-col justify-between group cursor-pointer rounded-2xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Icon className={`w-6 h-6 ${item.iconColor}`} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            {item.reward}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold uppercase tracking-wider text-[#00B8DD]">
                        {item.level}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2 group-hover:text-[#00B8DD] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      {item.isFree ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Luyện Thử Miễn Phí
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-500" /> Cần Đăng Nhập
                        </span>
                      )}
                      <span className="font-bold text-[#007D99] group-hover:text-[#00B8DD] flex items-center gap-1">
                        {item.isFree ? 'Luyện Ngay' : 'Mở Khóa'} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Quick summary card */}
            <motion.div {...fadeUp(0.4)}>
              <Card className="h-full p-6 border-2 border-dashed border-[#00B8DD]/40 bg-[#E6F8FC]/50 flex flex-col justify-between rounded-2xl">
                <div>
                  <div className="h-12 w-12 rounded-2xl bg-[#00B8DD] text-slate-950 flex items-center justify-center font-bold text-xl mb-4 shadow-md">
                    💎
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#007D99]">
                    Cơ Chế Khảo Thí Thông Minh
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">
                    Luyện Đúng Trọng Tâm • Lấp Mọi Lỗ Hổng
                  </h3>
                  <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0" />
                      <span>Không lãng phí thời gian vào bài quá dễ hoặc quá khó.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0" />
                      <span>Học sinh tự tin tăng 1 - 2.5 điểm chỉ sau 30 ngày.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00B8DD] shrink-0" />
                      <span>Được cộng kim cương 💎 sau mỗi đề thi hoàn thành.</span>
                    </li>
                  </ul>
                </div>

                <a href="#kho-mon-hoc" className="mt-5 pt-4 border-t border-[#00B8DD]/20">
                  <Button size="sm" className="w-full bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-bold rounded-xl">
                    Bắt Đầu Luyện Cấp Độ Cơ Bản Ngay
                  </Button>
                </a>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 5. SECTION: CẤU TRÚC 4 BƯỚC CỦA MỖI BÀI LUYỆN                */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <motion.div {...fadeUp(0)}>
              <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-3">
                CHUẨN SƯ PHẠM &amp; KHẢO THÍ
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
                Quy Trình 4 Phần Trong Từng Bài Luyện Tập
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
                Không chỉ là ngân hàng đề câu hỏi rời rạc. Mỗi bài luyện trong Schoolify được chuẩn hóa thành 4 tab workspace chuyên nghiệp:
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FOUR_STEP_WORKFLOW.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.step} {...fadeUp(idx * 0.1)}>
                  <Card className="p-6 h-full border-slate-200/90 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all duration-200 bg-white">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-black text-slate-300">
                          {step.step}
                        </span>
                        <div className={`p-2.5 rounded-xl border ${step.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B8DD]">
                        {step.tag}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 6. SECTION: BẢNG VÀNG THI ĐUA & KHO QUÀ STORE (GAMIFICATION) */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#0A1E38] via-slate-950 to-[#0A1E38] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Left: Gamification Value */}
            <div className="space-y-6">
              <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold">
                ĐUA TOP TOÀN QUỐC &amp; ĐỔI QUÀ THỰC TẾ
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Học Hăng Say • Đua Top Bảng Vàng • Tích Kim Cương 💎 Đổi Quà
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Mỗi câu hỏi hoàn thành đều giúp bạn tiến gần hơn tới đỉnh Bảng Vàng. Đăng nhập tài khoản học sinh để lưu lại thành tích và đổi voucher học tập, sách ôn thi cùng nhiều phần quà hấp dẫn!
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  size="lg"
                  onClick={handleLeaderboardClick}
                  className="bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-black rounded-xl text-sm"
                  leftIcon={<Trophy className="w-4 h-4" />}
                >
                  Đăng Nhập Đua Top Bảng Vàng
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleStoreClick}
                  className="border-slate-700 text-white hover:bg-white/10 rounded-xl text-sm font-semibold"
                  leftIcon={<Gift className="w-4 h-4 text-amber-400" />}
                >
                  Khám Phá Kho Quà Store
                </Button>
              </div>
            </div>

            {/* Right: Mock Leaderboard Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm">Bảng Vàng Thi Đua Tuần Này</span>
                </div>
                <span className="text-xs text-cyan-300 font-semibold">Cập nhật trực tiếp</span>
              </div>

              <div className="space-y-3">
                {LEADERBOARD_PREVIEW.map((user) => (
                  <div
                    key={user.rank}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-black text-amber-400 w-6 text-center">
                        #{user.rank}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.school}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-amber-300 block">{user.points} 💎</span>
                      <span className="text-[10px] text-slate-300">{user.badge}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleLeaderboardClick}
                  className="text-xs text-cyan-300 hover:text-cyan-200 font-bold hover:underline cursor-pointer"
                >
                  Đăng nhập để xem vị trí của bạn trên Bảng Xếp Hạng Toàn Quốc →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────── */}
      {/* 7. SECTION: FORM LIÊN HỆ & TƯ VẤN LỘ TRÌNH MIỄN PHÍ         */}
      {/* ──────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="primary" className="bg-[#00B8DD] text-slate-950 font-bold mb-3">
                ĐỒNG HÀNH CÙNG HỌC SINH
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Cần Tư Vấn Lộ Trình Luyện Thi Phù Hợp Năng Lực?
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base leading-relaxed">
                Đội ngũ cố vấn học thuật của Schoolify sẽ hỗ trợ phân tích điểm số hiện tại và đề xuất lộ trình luyện thi 5 cấp độ tối ưu nhất cho bạn.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#00B8DD]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Hotline Học Thuật</span>
                    <strong className="text-slate-800">028 7300 8888</strong>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#00B8DD]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Email Hỗ Trợ Luyện Thi</span>
                    <strong className="text-slate-800">luyenthi@schoolify.edu.vn</strong>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#00B8DD]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Cơ Sở Khảo Thí</span>
                    <strong className="text-slate-800">Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-3xl border border-slate-200/90 p-8 shadow-xl bg-slate-50/50">
              {contactSubmitted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Đã Gửi Thành Công!</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Cố vấn học thuật của Schoolify sẽ liên hệ với bạn trong vòng 24 giờ để gửi lộ trình ôn thi phù hợp.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Đăng Ký Nhận Lộ Trình Ôn Thi Miễn Phí
                  </h3>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Họ và Tên Học Sinh
                    </label>
                    <Input required placeholder="Ví dụ: Nguyễn Văn An" className="bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Khối Lớp
                      </label>
                      <Input required placeholder="Ví dụ: Lớp 11" className="bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Môn Cần Ôn
                      </label>
                      <Input required placeholder="Toán / Lý / Anh..." className="bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Số Điện Thoại / Zalo
                    </label>
                    <Input required type="tel" placeholder="0912 345 678" className="bg-white" />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#00B8DD] hover:bg-[#009BBD] text-slate-950 font-bold rounded-xl shadow-md"
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Gửi Thông Tin Nhận Lộ Trình
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Level Selection Modal (Opens when clicking any subject) ── */}
      <LevelSelectionModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        subject={selectedSubject}
      />

      {/* ── Require Login Modal (Opens for Advanced, HSG, Leaderboard, Store) ── */}
      <RequireLoginModal
        isOpen={requireLoginOpen}
        onClose={() => setRequireLoginOpen(false)}
        reason={loginReason}
        targetLevelName={targetLevelName}
        onContinueGuest={() => {
          setRequireLoginOpen(false);
          // Scroll to subjects grid so guest can pick a basic subject
          const el = document.getElementById('kho-mon-hoc');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
}
