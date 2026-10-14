'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Sliders,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  Layers,
  Scale,
  Save,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Table,
  Zap,
  Award,
  Flame,
  Trophy,
  Crown,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AVAILABLE_SUBJECTS, getChaptersForSubject } from '@/constants/curriculum';
import { PracticeLevel } from '@/types/subject';
import { QuestionDifficulty } from '@/services/mock/practice-flow-data';
import {
  LEVEL_DIFFICULTY_MATRIX,
  PREVIOUS_CHAPTER_RATIO,
  getActiveMatrixConfig,
  getActivePreviousChapterRatio,
  saveActiveMatrixConfig,
  resetActiveMatrixConfig,
} from '@/services/mock/question-matrix-engine';
import {
  ChapterRatioItem,
  createDefaultMatrixConfig,
  INITIAL_SUBJECT_MATRICES,
} from '@/services/mock/exam-matrix-configs';

// Metadata cho 6 Level luyện thi / đề thi
interface LevelMeta {
  id: PracticeLevel;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
  badgeVariant: 'success' | 'default' | 'purple' | 'primary' | 'warning' | 'danger';
  activeColor: string;
}

const LEVEL_LIST: LevelMeta[] = [
  {
    id: 'BASIC',
    name: 'Cơ Bản',
    badge: 'SGK & Lý Thuyết',
    tagline: 'Nắm chắc kiến thức cốt lõi',
    description: '100% định nghĩa, công thức và dạng bài tập cơ bản SGK chuẩn Bộ GD&ĐT.',
    icon: <BookOpen className="w-4 h-4 text-emerald-500" />,
    badgeVariant: 'success',
    activeColor: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
  },
  {
    id: 'MEDIUM',
    name: 'Trung Bình',
    badge: 'Học Kỳ & Tốt Nghiệp',
    tagline: 'Rèn luyện phản xạ chuẩn mực',
    description: 'Dạng bài thông hiểu và vận dụng vừa sức, bám sát đề thi giữa kỳ, cuối kỳ và tốt nghiệp.',
    icon: <Award className="w-4 h-4 text-sky-500" />,
    badgeVariant: 'default',
    activeColor: 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300',
  },
  {
    id: 'ADVANCED',
    name: 'Nâng Cao',
    badge: 'Vận Dụng Cao (9-10đ)',
    tagline: 'Chinh phục điểm tuyệt đối',
    description: 'Bài toán phân hóa, tích hợp liên môn đòi hỏi tư duy biến tấu và giải nhanh.',
    icon: <Flame className="w-4 h-4 text-purple-500" />,
    badgeVariant: 'purple',
    activeColor: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
  },
  {
    id: 'ASSESSMENT',
    name: 'Đánh Giá Năng Lực',
    badge: 'ĐGNL ĐHQG / ĐHBK',
    tagline: 'Đa tầng tư duy phân loại',
    description: 'Khảo sát năng lực tư duy định lượng, đọc hiểu dữ liệu và giải quyết vấn đề.',
    icon: <Sparkles className="w-4 h-4 text-primary" />,
    badgeVariant: 'default',
    activeColor: 'border-[#00B8DD] bg-[#E6F8FC]/60 dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD]',
  },
  {
    id: 'PROVINCIAL_EXCELLENT',
    name: 'HSG Tỉnh',
    badge: 'Học Sinh Giỏi Tỉnh / TP',
    tagline: 'Đề thi tuyển chọn Tỉnh/Thành phố',
    description: 'Tuyển chọn học sinh giỏi cấp Tỉnh/Thành phố với mức độ phân hóa cao.',
    icon: <Trophy className="w-4 h-4 text-amber-500" />,
    badgeVariant: 'warning',
    activeColor: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
  },
  {
    id: 'NATIONAL_EXCELLENT',
    name: 'HSG Quốc Gia',
    badge: 'Olympic & HSGQG',
    tagline: 'Đỉnh cao trí tuệ học sinh giỏi',
    description: 'Bộ đề thi chọn đội tuyển Olympic và kỳ thi Học sinh giỏi Quốc gia.',
    icon: <Crown className="w-4 h-4 text-rose-500" />,
    badgeVariant: 'danger',
    activeColor: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
  },
];

// Định nghĩa tỉ lệ % của 4 loại câu hỏi (0 - 100)
interface DifficultyPercentage {
  EASY: number; // Nhận biết
  MEDIUM: number; // Thông hiểu
  HARD: number; // Vận dụng
  VERY_HARD: number; // Vận dụng cao
}

type LevelMatrixPercentages = Record<PracticeLevel, DifficultyPercentage>;

// Hàm chuyển đổi từ 0.0 - 1.0 sang 0 - 100%
function convertMatrixToPercentages(
  matrix: Record<PracticeLevel, Record<QuestionDifficulty, number>>
): LevelMatrixPercentages {
  const result = {} as LevelMatrixPercentages;
  (Object.keys(matrix) as PracticeLevel[]).forEach((lvl) => {
    const item = matrix[lvl];
    result[lvl] = {
      EASY: Math.round((item?.EASY ?? 0) * 100),
      MEDIUM: Math.round((item?.MEDIUM ?? 0) * 100),
      HARD: Math.round((item?.HARD ?? 0) * 100),
      VERY_HARD: Math.round((item?.VERY_HARD ?? 0) * 100),
    };
  });
  return result;
}

// Hàm chuyển đổi từ 0 - 100% về 0.0 - 1.0 để lưu vào hệ thống engine
function convertPercentagesToMatrix(
  percentages: LevelMatrixPercentages
): Record<PracticeLevel, Record<QuestionDifficulty, number>> {
  const result = {} as Record<PracticeLevel, Record<QuestionDifficulty, number>>;
  (Object.keys(percentages) as PracticeLevel[]).forEach((lvl) => {
    const item = percentages[lvl];
    result[lvl] = {
      EASY: item.EASY / 100,
      MEDIUM: item.MEDIUM / 100,
      HARD: item.HARD / 100,
      VERY_HARD: item.VERY_HARD / 100,
    };
  });
  return result;
}

export default function AdminExamsMatrixPage() {
  // 1. Quản lý tỉ lệ 4 loại câu hỏi cho cả 6 Level
  const [levelMatrices, setLevelMatrices] = React.useState<LevelMatrixPercentages>(() => {
    return convertMatrixToPercentages(LEVEL_DIFFICULTY_MATRIX);
  });

  // Tỉ lệ câu hỏi liên quan tới các chương trước (Rolling Previous Chapter Ratio: 0 - 100%)
  const [previousChapterPercentage, setPreviousChapterPercentage] = React.useState<number>(20);

  // Level hiện tại đang được chọn để chỉnh sửa chi tiết
  const [activeLevel, setActiveLevel] = React.useState<PracticeLevel>('BASIC');

  // Môn học & Khối lớp để cấu hình phân bổ chương học
  const [selectedSubject, setSelectedSubject] = React.useState<string>('Toán học');
  const [selectedGrade, setSelectedGrade] = React.useState<string>('12');
  const [totalQuestionsRef, setTotalQuestionsRef] = React.useState<number>(40);

  // Danh sách các chương theo môn học
  const [chapterRatios, setChapterRatios] = React.useState<ChapterRatioItem[]>(() => {
    const defaultCfg = createDefaultMatrixConfig('Toán học', '12');
    return defaultCfg.chapter_ratios;
  });

  // Chế độ xem: Bảng tổng hợp so sánh 6 level
  const [showAllLevelsTable, setShowAllLevelsTable] = React.useState(true);
  const [isClientLoaded, setIsClientLoaded] = React.useState(false);

  // Khi component mount trên client, tải cấu hình đã lưu trong localStorage nếu có
  React.useEffect(() => {
    setIsClientLoaded(true);
    const active = getActiveMatrixConfig();
    setLevelMatrices(convertMatrixToPercentages(active));

    const prevRatio = getActivePreviousChapterRatio();
    setPreviousChapterPercentage(Math.round(prevRatio * 100));
  }, []);

  // Cập nhật danh sách chương khi đổi môn học hoặc khối lớp
  React.useEffect(() => {
    const foundSubject = INITIAL_SUBJECT_MATRICES.find(
      (m) => m.subject === selectedSubject && m.grade_level === selectedGrade
    );
    if (foundSubject) {
      setChapterRatios(JSON.parse(JSON.stringify(foundSubject.chapter_ratios)));
      setTotalQuestionsRef(foundSubject.total_questions);
    } else {
      const fresh = createDefaultMatrixConfig(selectedSubject, selectedGrade);
      setChapterRatios(fresh.chapter_ratios);
      setTotalQuestionsRef(fresh.total_questions);
    }
  }, [selectedSubject, selectedGrade]);

  // Thông tin level đang chọn
  const currentLevelMeta = LEVEL_LIST.find((l) => l.id === activeLevel) || LEVEL_LIST[0];
  const currentLevelRatio = levelMatrices[activeLevel] || { EASY: 0, MEDIUM: 0, HARD: 0, VERY_HARD: 0 };

  // Tổng % của level đang chọn
  const currentLevelTotal =
    currentLevelRatio.EASY + currentLevelRatio.MEDIUM + currentLevelRatio.HARD + currentLevelRatio.VERY_HARD;

  // Cập nhật % của 1 loại câu hỏi cho level đang chọn
  const handleDifficultyChange = (key: QuestionDifficulty, value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    setLevelMatrices((prev) => ({
      ...prev,
      [activeLevel]: {
        ...prev[activeLevel],
        [key]: clamped,
      },
    }));
  };

  // Tự động cân đối 4 loại của level đang chọn về đúng 100%
  const handleAutoBalanceLevel = (lvlId: PracticeLevel = activeLevel) => {
    const curr = levelMatrices[lvlId];
    const sum = curr.EASY + curr.MEDIUM + curr.HARD + curr.VERY_HARD;

    if (sum === 0) {
      // Mặc định an toàn
      setLevelMatrices((prev) => ({
        ...prev,
        [lvlId]: { EASY: 50, MEDIUM: 30, HARD: 15, VERY_HARD: 5 },
      }));
      return;
    }

    const easy = Math.round((curr.EASY / sum) * 100);
    const med = Math.round((curr.MEDIUM / sum) * 100);
    const hard = Math.round((curr.HARD / sum) * 100);
    const veryHard = 100 - (easy + med + hard);

    setLevelMatrices((prev) => ({
      ...prev,
      [lvlId]: {
        EASY: Math.max(0, easy),
        MEDIUM: Math.max(0, med),
        HARD: Math.max(0, hard),
        VERY_HARD: Math.max(0, veryHard),
      },
    }));
    toast.success(`Đã tự động cân đối tròn 100% cho Level "${LEVEL_LIST.find((l) => l.id === lvlId)?.name}"`);
  };

  // Khôi phục tỉ lệ mặc định cho Level đang chọn
  const handleResetLevelDefault = (lvlId: PracticeLevel = activeLevel) => {
    const def = LEVEL_DIFFICULTY_MATRIX[lvlId];
    if (def) {
      setLevelMatrices((prev) => ({
        ...prev,
        [lvlId]: {
          EASY: Math.round(def.EASY * 100),
          MEDIUM: Math.round(def.MEDIUM * 100),
          HARD: Math.round(def.HARD * 100),
          VERY_HARD: Math.round(def.VERY_HARD * 100),
        },
      }));
      toast.info(`Đã khôi phục tỉ lệ mặc định cho Level "${LEVEL_LIST.find((l) => l.id === lvlId)?.name}"`);
    }
  };

  // Khôi phục tất cả 6 level về mặc định gốc của hệ thống
  const handleResetAllToSystemDefaults = () => {
    resetActiveMatrixConfig();
    setLevelMatrices(convertMatrixToPercentages(LEVEL_DIFFICULTY_MATRIX));
    setPreviousChapterPercentage(Math.round(PREVIOUS_CHAPTER_RATIO * 100));
    toast.success('Đã khôi phục toàn bộ ma trận 6 Level về mặc định gốc!');
  };

  // Bật/tắt 1 chương học
  const handleToggleChapter = (index: number) => {
    setChapterRatios((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.selected = !item.selected;
      if (!item.selected) item.ratio = 0;
      updated[index] = item;
      return updated;
    });
  };

  // Cập nhật % của 1 chương
  const handleChapterRatioChange = (index: number, value: number) => {
    setChapterRatios((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        ratio: Math.max(0, Math.min(100, value)),
      };
      return updated;
    });
  };

  // Chia đều % cho các chương được chọn
  const handleEqualizeChapters = () => {
    const selectedIndices = chapterRatios
      .map((ch, idx) => (ch.selected ? idx : -1))
      .filter((idx) => idx !== -1);

    if (selectedIndices.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 chương để chia tỉ lệ!');
      return;
    }

    const count = selectedIndices.length;
    const base = Math.floor(100 / count);
    const rem = 100 - base * count;

    setChapterRatios((prev) =>
      prev.map((ch, idx) => {
        const order = selectedIndices.indexOf(idx);
        if (order !== -1) {
          return { ...ch, ratio: base + (order === 0 ? rem : 0) };
        }
        return { ...ch, ratio: 0 };
      })
    );
    toast.success(`Đã chia đều 100% cho ${count} chương được chọn`);
  };

  // Tổng % của các chương đang chọn
  const totalChapterPercentage = chapterRatios
    .filter((ch) => ch.selected)
    .reduce((sum, ch) => sum + ch.ratio, 0);

  // Số chương được chọn
  const selectedChaptersCount = chapterRatios.filter((ch) => ch.selected).length;

  // LƯU CẤU HÌNH TOÀN BỘ MA TRẬN VÀO HỆ THỐNG
  const handleSaveAllConfig = () => {
    // Kiểm tra xem có level nào chưa đủ 100% không
    const invalidLevels: string[] = [];
    (Object.keys(levelMatrices) as PracticeLevel[]).forEach((lvl) => {
      const r = levelMatrices[lvl];
      const sum = r.EASY + r.MEDIUM + r.HARD + r.VERY_HARD;
      if (sum !== 100) {
        const name = LEVEL_LIST.find((l) => l.id === lvl)?.name || lvl;
        invalidLevels.push(`${name} (${sum}%)`);
      }
    });

    if (invalidLevels.length > 0) {
      toast.error(`Có level chưa đủ tròn 100%: ${invalidLevels.join(', ')}. Vui lòng cân đối lại!`);
      return;
    }

    if (totalChapterPercentage !== 100 && selectedChaptersCount > 0) {
      toast.error(`Tổng tỉ lệ Chương học đang là ${totalChapterPercentage}%. Vui lòng chỉnh về đúng 100%!`);
      return;
    }

    // Chuyển đổi và lưu vào localStorage thông qua engine
    const matrixToSave = convertPercentagesToMatrix(levelMatrices);
    const prevRatioToSave = previousChapterPercentage / 100;
    saveActiveMatrixConfig(matrixToSave, prevRatioToSave);

    toast.success('Đã lưu cấu hình ma trận trộn đề thành công!', {
      description: 'Hệ thống sẽ áp dụng ngay lập tức tỉ lệ 4 loại câu hỏi cho các level (Cơ bản, Trung bình, Nâng cao...) và tỉ lệ chương học khi học sinh luyện thi.',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header Tinh Gọn & Rõ Ràng */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E6F8FC] dark:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD]">
              <Sliders className="w-5 h-5 text-primary" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Quản Lý Tỉ Lệ Trộn Đề & Level Luyện Thi
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Cấu hình tỉ lệ <strong>4 loại câu hỏi (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)</strong> cho từng Level thi (<strong>Cơ bản, Trung bình, Nâng cao, ĐGNL, HSG</strong>) và tỉ lệ phối trộn các chương học.
          </p>
        </div>

        {/* Nút Hành Động Toàn Cục */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAllToSystemDefaults}
            className="rounded-xl text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Khôi phục mặc định
          </Button>

          <Button
            size="sm"
            onClick={handleSaveAllConfig}
            className="rounded-xl text-xs font-semibold bg-[#00B8DD] hover:bg-[#009fb0] text-white gap-1.5 shadow-sm px-4"
          >
            <Save className="w-3.5 h-3.5" />
            Lưu Toàn Bộ Ma Trận
          </Button>
        </div>
      </div>

      {/* 2. Bộ Chọn Cấp Độ (Level Selector Pills) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-primary" />
            Chọn Level Cần Chỉnh Tỉ Lệ 4 Loại Câu Hỏi:
          </span>
          <span className="text-xs text-slate-400">
            Đang chọn: <strong className="text-primary">{currentLevelMeta.name}</strong> ({currentLevelMeta.badge})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {LEVEL_LIST.map((lvl) => {
            const isSelected = activeLevel === lvl.id;
            const ratios = levelMatrices[lvl.id] || { EASY: 0, MEDIUM: 0, HARD: 0, VERY_HARD: 0 };
            const sum = ratios.EASY + ratios.MEDIUM + ratios.HARD + ratios.VERY_HARD;

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setActiveLevel(lvl.id)}
                className={cn(
                  'flex flex-col text-left p-3 rounded-2xl border transition-all text-xs relative overflow-hidden',
                  isSelected
                    ? cn('border-2 shadow-xs ring-2 ring-primary/20', lvl.activeColor)
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    {lvl.icon}
                    <span>{lvl.name}</span>
                  </div>
                  <Badge variant={sum === 100 ? 'success' : 'danger'} className="text-[10px] px-1.5 py-0 font-mono">
                    {sum}%
                  </Badge>
                </div>

                <span className="text-[11px] text-slate-500 line-clamp-1">{lvl.badge}</span>

                {/* Mini Stacked Bar */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex mt-2">
                  <div style={{ width: `${ratios.EASY}%` }} className="bg-sky-500" />
                  <div style={{ width: `${ratios.MEDIUM}%` }} className="bg-emerald-500" />
                  <div style={{ width: `${ratios.HARD}%` }} className="bg-amber-500" />
                  <div style={{ width: `${ratios.VERY_HARD}%` }} className="bg-rose-500" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Khối Chỉnh Sửa Chi Tiết (Dual-Panel: Cột Trái Chỉnh 4 Loại cho Level - Cột Phải Chỉnh Chương) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =========================================================================
            CỘT TRÁI (6 Cols): CHỈNH TỈ LỆ 4 LOẠI CÂU HỎI CHO LEVEL ĐANG CHỌN
        ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-5">
              {/* Header Cột Level */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      {currentLevelMeta.icon}
                      Level {currentLevelMeta.name}
                    </span>
                    <Badge variant={currentLevelMeta.badgeVariant} className="text-xs">
                      {currentLevelMeta.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{currentLevelMeta.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant={currentLevelTotal === 100 ? 'success' : 'danger'}
                    className="font-mono text-xs px-2.5 py-1"
                  >
                    Tổng: {currentLevelTotal}%
                  </Badge>
                  {currentLevelTotal !== 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAutoBalanceLevel(activeLevel)}
                      className="h-7 text-xs text-primary px-2 hover:bg-cyan-50 dark:hover:bg-slate-800"
                    >
                      <Scale className="w-3 h-3 mr-1" />
                      Cân đối 100%
                    </Button>
                  )}
                </div>
              </div>

              {/* Stacked Progress Bar Trực Quan */}
              <div className="space-y-1.5">
                <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: `${currentLevelRatio.EASY}%` }}
                    className="bg-sky-500 transition-all duration-300"
                    title={`Nhận biết: ${currentLevelRatio.EASY}%`}
                  />
                  <div
                    style={{ width: `${currentLevelRatio.MEDIUM}%` }}
                    className="bg-emerald-500 transition-all duration-300"
                    title={`Thông hiểu: ${currentLevelRatio.MEDIUM}%`}
                  />
                  <div
                    style={{ width: `${currentLevelRatio.HARD}%` }}
                    className="bg-amber-500 transition-all duration-300"
                    title={`Vận dụng: ${currentLevelRatio.HARD}%`}
                  />
                  <div
                    style={{ width: `${currentLevelRatio.VERY_HARD}%` }}
                    className="bg-rose-500 transition-all duration-300"
                    title={`Vận dụng cao: ${currentLevelRatio.VERY_HARD}%`}
                  />
                </div>

                <div className="grid grid-cols-4 text-[11px] font-semibold text-center pt-0.5">
                  <span className="text-sky-600 dark:text-sky-400">
                    Nhận biết: {currentLevelRatio.EASY}%
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Thông hiểu: {currentLevelRatio.MEDIUM}%
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    Vận dụng: {currentLevelRatio.HARD}%
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    V.Dụng cao: {currentLevelRatio.VERY_HARD}%
                  </span>
                </div>
              </div>

              {/* 4 Thẻ Điều Chỉnh 4 Loại Câu Hỏi */}
              <div className="space-y-3 pt-1">
                {/* 1. Nhận biết (Easy) */}
                <div className="p-3.5 rounded-2xl border border-sky-100 dark:border-sky-950/60 bg-sky-50/40 dark:bg-sky-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      1. Câu Hỏi Nhận Biết (Dễ / SGK)
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-700 dark:text-sky-300">
                      {currentLevelRatio.EASY}% (~
                      {Math.round((totalQuestionsRef * currentLevelRatio.EASY) / 100)}/{totalQuestionsRef} câu)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      aria-label="Tỉ lệ câu hỏi Nhận biết"
                      value={currentLevelRatio.EASY}
                      onChange={(e) => handleDifficultyChange('EASY', Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        aria-label="Nhập tỉ lệ % Nhận biết"
                        value={currentLevelRatio.EASY}
                        onChange={(e) => handleDifficultyChange('EASY', Number(e.target.value))}
                        className="w-14 h-8 text-xs font-mono text-center p-0 rounded-xl"
                      />
                      <span className="text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* 2. Thông hiểu (Medium) */}
                <div className="p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      2. Câu Hỏi Thông Hiểu (Trung Bình)
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {currentLevelRatio.MEDIUM}% (~
                      {Math.round((totalQuestionsRef * currentLevelRatio.MEDIUM) / 100)}/{totalQuestionsRef} câu)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      aria-label="Tỉ lệ câu hỏi Thông hiểu"
                      value={currentLevelRatio.MEDIUM}
                      onChange={(e) => handleDifficultyChange('MEDIUM', Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        aria-label="Nhập tỉ lệ % Thông hiểu"
                        value={currentLevelRatio.MEDIUM}
                        onChange={(e) => handleDifficultyChange('MEDIUM', Number(e.target.value))}
                        className="w-14 h-8 text-xs font-mono text-center p-0 rounded-xl"
                      />
                      <span className="text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* 3. Vận dụng (Hard) */}
                <div className="p-3.5 rounded-2xl border border-amber-100 dark:border-amber-950/60 bg-amber-50/40 dark:bg-amber-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      3. Câu Hỏi Vận Dụng (Khó / Bài Toán Phân Hóa)
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
                      {currentLevelRatio.HARD}% (~
                      {Math.round((totalQuestionsRef * currentLevelRatio.HARD) / 100)}/{totalQuestionsRef} câu)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      aria-label="Tỉ lệ câu hỏi Vận dụng"
                      value={currentLevelRatio.HARD}
                      onChange={(e) => handleDifficultyChange('HARD', Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        aria-label="Nhập tỉ lệ % Vận dụng"
                        value={currentLevelRatio.HARD}
                        onChange={(e) => handleDifficultyChange('HARD', Number(e.target.value))}
                        className="w-14 h-8 text-xs font-mono text-center p-0 rounded-xl"
                      />
                      <span className="text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* 4. Vận dụng cao (Very Hard) */}
                <div className="p-3.5 rounded-2xl border border-rose-100 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      4. Câu Hỏi Vận Dụng Cao (Điểm 9-10 / Chuyên Sâu)
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-300">
                      {currentLevelRatio.VERY_HARD}% (~
                      {Math.round((totalQuestionsRef * currentLevelRatio.VERY_HARD) / 100)}/{totalQuestionsRef} câu)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      aria-label="Tỉ lệ câu hỏi Vận dụng cao"
                      value={currentLevelRatio.VERY_HARD}
                      onChange={(e) => handleDifficultyChange('VERY_HARD', Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        aria-label="Nhập tỉ lệ % Vận dụng cao"
                        value={currentLevelRatio.VERY_HARD}
                        onChange={(e) => handleDifficultyChange('VERY_HARD', Number(e.target.value))}
                        className="w-14 h-8 text-xs font-mono text-center p-0 rounded-xl"
                      />
                      <span className="text-xs text-slate-400 font-bold">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chân Thẻ: Tiện ích khôi phục cho Level */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Áp dụng khi học sinh chọn cấp độ &quot;{currentLevelMeta.name}&quot;
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleResetLevelDefault(activeLevel)}
                className="h-7 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Khôi phục Level này
              </Button>
            </div>
          </Card>
        </div>

        {/* =========================================================================
            CỘT PHẢI (6 Cols): CHỈNH TỈ LỆ CÁC CHƯƠNG HỌC & CÂU HỎI LIÊN QUAN
        ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 border-slate-200 dark:border-slate-800 shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-4">
              {/* Tiêu đề & Chọn môn */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Tỉ Lệ Trộn Các Chương Học
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Phân bổ câu hỏi theo chương SGK và tỉ lệ câu hỏi liên quan chương trước
                  </p>
                </div>

                {/* Chọn Môn & Lớp */}
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Chọn Môn học"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="h-8 px-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    {AVAILABLE_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Chọn Khối lớp"
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="h-8 px-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary shadow-xs"
                  >
                    <option value="12">Lớp 12</option>
                    <option value="11">Lớp 11</option>
                    <option value="10">Lớp 10</option>
                  </select>
                </div>
              </div>

              {/* 1. Thanh Chỉnh Tỉ Lệ Câu Hỏi Liên Quan Các Chương Trước (Rolling Ratio) */}
              <div className="p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    Tỉ Lệ Câu Hỏi Liên Quan Tới Các Chương Trước (Cuốn chiếu)
                  </span>
                  <span className="text-xs font-mono font-bold text-primary">
                    {previousChapterPercentage}% cũ / {100 - previousChapterPercentage}% mới
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  Khi luyện thi từ Chương 2 trở đi: hệ thống dành {previousChapterPercentage}% câu hỏi ôn tập các chương trước và {100 - previousChapterPercentage}% cho chương hiện tại.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={5}
                    aria-label="Tỉ lệ câu hỏi ôn tập chương trước"
                    value={previousChapterPercentage}
                    onChange={(e) => setPreviousChapterPercentage(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      aria-label="Nhập tỉ lệ % chương trước"
                      value={previousChapterPercentage}
                      onChange={(e) => setPreviousChapterPercentage(Number(e.target.value))}
                      className="w-14 h-8 text-xs font-mono text-center p-0 rounded-xl"
                    />
                    <span className="text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>
              </div>

              {/* 2. Tiện ích phân bổ chương tổng hợp */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Phân bổ từng chương ({selectedChaptersCount}/{chapterRatios.length} chương)
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={totalChapterPercentage === 100 ? 'success' : 'danger'}
                    className="font-mono text-xs px-2"
                  >
                    Tổng: {totalChapterPercentage}%
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEqualizeChapters}
                    className="h-6 text-[11px] px-2 rounded-lg"
                  >
                    Chia đều
                  </Button>
                </div>
              </div>

              {/* Danh Sách Chương Học */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {chapterRatios.map((item, idx) => {
                  return (
                    <div
                      key={item.chapter}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all',
                        item.selected
                          ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-2xs'
                          : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 opacity-60'
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleToggleChapter(idx)}
                            className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                          />
                          <span
                            className={cn(
                              'text-xs font-medium line-clamp-1',
                              item.selected
                                ? 'text-slate-900 dark:text-slate-100 font-semibold'
                                : 'text-slate-500 line-through'
                            )}
                          >
                            {item.chapter}
                          </span>
                        </label>

                        {item.selected && (
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="range"
                              min={0}
                              max={100}
                              step={5}
                              aria-label={`Tỉ lệ ${item.chapter}`}
                              value={item.ratio}
                              onChange={(e) => handleChapterRatioChange(idx, Number(e.target.value))}
                              className="w-20 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex items-center gap-0.5">
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                aria-label={`Nhập % ${item.chapter}`}
                                value={item.ratio}
                                onChange={(e) => handleChapterRatioChange(idx, Number(e.target.value))}
                                className="w-12 h-6 text-xs font-mono text-center p-0 rounded-lg"
                              />
                              <span className="text-[11px] text-slate-400 font-bold">%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Được nạp theo SGK {selectedSubject} Lớp {selectedGrade}</span>
              <span>Tổng câu tham chiếu: {totalQuestionsRef} câu</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Bảng So Sánh Ma Trận Cả 6 Level (Master Matrix Comparison Table) */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div
          className="p-4 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer border-b border-slate-200 dark:border-slate-800"
          onClick={() => setShowAllLevelsTable(!showAllLevelsTable)}
        >
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bảng Tổng Hợp So Sánh Ma Trận 4 Loại Câu Hỏi Của Cả 6 Level
            </h3>
            <Badge variant="secondary" className="text-[11px] font-normal">
              Cơ Bản • Trung Bình • Nâng Cao • ĐGNL • HSG Tỉnh • HSG Quốc Gia
            </Badge>
          </div>
          <button
            type="button"
            aria-label={showAllLevelsTable ? 'Thu gọn bảng' : 'Mở rộng bảng'}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {showAllLevelsTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showAllLevelsTable && (
          <div className="overflow-x-auto p-4">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300">
                  <th className="py-2.5 px-4 font-semibold">Cấp Độ Luyện Thi (Level)</th>
                  <th className="py-2.5 px-3 font-semibold text-center text-sky-600 dark:text-sky-400">
                    Nhận biết (EASY)
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center text-emerald-600 dark:text-emerald-400">
                    Thông hiểu (MEDIUM)
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center text-amber-600 dark:text-amber-400">
                    Vận dụng (HARD)
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center text-rose-600 dark:text-rose-400">
                    V.Dụng cao (VERY_HARD)
                  </th>
                  <th className="py-2.5 px-4 font-semibold">Thước Phân Bổ Trực Quan</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Tổng %</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {LEVEL_LIST.map((lvl) => {
                  const isCurrent = activeLevel === lvl.id;
                  const ratio = levelMatrices[lvl.id] || { EASY: 0, MEDIUM: 0, HARD: 0, VERY_HARD: 0 };
                  const total = ratio.EASY + ratio.MEDIUM + ratio.HARD + ratio.VERY_HARD;

                  return (
                    <tr
                      key={lvl.id}
                      onClick={() => setActiveLevel(lvl.id)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isCurrent
                          ? 'bg-cyan-50/50 dark:bg-cyan-950/20 font-semibold'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full',
                              isCurrent ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                            )}
                          />
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            {lvl.icon}
                            <span>{lvl.name}</span>
                          </div>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal">
                            {lvl.badge}
                          </Badge>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-sky-700 dark:text-sky-300">
                        {ratio.EASY}%
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-300">
                        {ratio.MEDIUM}%
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-amber-700 dark:text-amber-300">
                        {ratio.HARD}%
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-700 dark:text-rose-300">
                        {ratio.VERY_HARD}%
                      </td>

                      <td className="py-3 px-4">
                        <div className="h-2.5 w-40 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                          <div
                            style={{ width: `${ratio.EASY}%` }}
                            className="bg-sky-500"
                            title={`Nhận biết: ${ratio.EASY}%`}
                          />
                          <div
                            style={{ width: `${ratio.MEDIUM}%` }}
                            className="bg-emerald-500"
                            title={`Thông hiểu: ${ratio.MEDIUM}%`}
                          />
                          <div
                            style={{ width: `${ratio.HARD}%` }}
                            className="bg-amber-500"
                            title={`Vận dụng: ${ratio.HARD}%`}
                          />
                          <div
                            style={{ width: `${ratio.VERY_HARD}%` }}
                            className="bg-rose-500"
                            title={`Vận dụng cao: ${ratio.VERY_HARD}%`}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold">
                        <Badge variant={total === 100 ? 'success' : 'danger'} className="text-[11px] py-0">
                          {total}%
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant={isCurrent ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            'h-7 text-xs rounded-lg px-2.5',
                            isCurrent && 'bg-[#00B8DD] hover:bg-[#009fb0] text-white'
                          )}
                        >
                          {isCurrent ? (
                            <>
                              <Check className="w-3 h-3 mr-1" /> Đang chỉnh
                            </>
                          ) : (
                            'Chỉnh sửa'
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
