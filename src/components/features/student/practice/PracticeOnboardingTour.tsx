'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  Sliders,
  Bot,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const PRACTICE_TOUR_STORAGE_KEY = 'schoolify_practice_tour_seen_v1';

interface TourStep {
  id: string;
  targetSelector: string;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  icon: React.ReactNode;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step-dual-mode',
    targetSelector: '#dual-mode-hub',
    badge: 'Bước 1 / 4 • Hai Chế Độ Cốt Lõi',
    title: 'Chọn Chế Độ: Luyện Chuyên Đề hoặc Thi Thử Chuẩn Hóa',
    description:
      'Hệ thống tách biệt rõ 2 mục tiêu học tập cho học sinh THPT (Lớp 10, 11, 12) môn Toán & Tin học:',
    highlights: [
      '🎯 Luyện theo chuyên đề (Tag): Tự chọn Chương & Mức độ nhận thức để nắm chắc từng dạng bài.',
      '🏆 Thi thử chuẩn cấu trúc: Ma trận cố định (40% NB - 30% TH - 20% VD - 10% VDC), đếm ngược nghiêm ngặt.',
    ],
    icon: <Target className="w-5 h-5 text-cyan-400" />,
  },
  {
    id: 'step-tag-matrix',
    targetSelector: '#tag-matrix-builder',
    badge: 'Bước 2 / 4 • Ma Trận Tag 4 Trục',
    title: 'Bốc Câu Hỏi Trắc Nghiệm Tự Động Theo Tag',
    description:
      'Ngân hàng câu hỏi được gắn Tag 4 trục (Môn/Lớp • Chuyên đề • Mức độ nhận thức • Bẫy sai lầm):',
    highlights: [
      'Tùy chỉnh linh hoạt Môn Toán / Tin học, Khối 10-11-12 và Chuyên đề trọng tâm.',
      'Chọn lọc đúng mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao) và số câu (5 - 20 câu).',
    ],
    icon: <Sliders className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 'step-socratic-ai',
    targetSelector: '#ai-socratic-preview',
    badge: 'Bước 3 / 4 • Gia Sư AI Socratic 1-1',
    title: 'Kẹt Câu Khó? Hỏi Ngay Gia Sư AI Gợi Mở Tư Duy',
    description:
      'Trong phòng thi, mỗi câu hỏi đều có nút "💡 Hỏi Gia Sư AI câu này" truyền thẳng ngữ cảnh câu hỏi & Tag:',
    highlights: [
      'Không đưa đáp án chép sẵn — AI gợi mở công thức Toán hoặc truy vết từng dòng code Python/SQL.',
      'Chỉ rõ Bẫy sai lầm (Trap Tag) mà học sinh vừa mắc phải để nhớ sâu bản chất.',
    ],
    icon: <Bot className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: 'step-gap-diagnostic',
    targetSelector: '#gap-diagnostic-preview',
    badge: 'Bước 4 / 4 • Chẩn Đoán Lỗ Hổng & Luyện Bù',
    title: 'Bóc Tách Lỗ Hổng Kiến Thức & Luyện Bù 5 Câu Yếu',
    description:
      'Sau khi nộp bài, hệ thống không chỉ chấm điểm mà còn thống kê độ chính xác theo từng Tag chuyên đề:',
    highlights: [
      'Phân nhóm trực quan: 🟢 Vững vàng (≥75%), 🟡 Cần ôn lại (50-74%), 🔴 Báo động đỏ (<50%).',
      'Bấm 1 chạm "⚡ Luyện bù ngay 5 câu dạng đang yếu" để lấp lỗ hổng kiến thức tức thì.',
    ],
    icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
  },
];

interface PracticeOnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PracticeOnboardingTour({
  isOpen,
  onClose,
}: PracticeOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];

  const handleDismiss = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(PRACTICE_TOUR_STORAGE_KEY, 'true');
      } catch {
        // ignore storage errors
      }
    }
    onClose();
  }, [onClose]);

  // Reset về bước 1 mỗi khi mở lại tour
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Lắng nghe phím ESC để bỏ qua ngay lập tức
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight') {
        setCurrentStep((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, handleDismiss]);

  // Tính toán vị trí khung Spotlight và cuộn mượt tới phần tử mục tiêu
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;

    const updateSpotlight = () => {
      const el = document.querySelector(step.targetSelector) as HTMLElement | null;
      if (!el) {
        setTargetRect(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      setTargetRect({
        top: Math.max(8, rect.top - 6),
        left: Math.max(8, rect.left - 6),
        width: Math.min(window.innerWidth - 16, rect.width + 12),
        height: rect.height + 12,
      });
    };

    const el = document.querySelector(step.targetSelector) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const timer = window.setTimeout(updateSpotlight, 260);
    updateSpotlight();

    window.addEventListener('resize', updateSpotlight);
    window.addEventListener('scroll', updateSpotlight, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlight);
      window.removeEventListener('scroll', updateSpotlight);
    };
  }, [isOpen, currentStep, step.targetSelector]);

  if (!isOpen) return null;

  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <div
      data-testid="practice-onboarding-tour"
      className="fixed inset-0 z-[120] pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Hướng dẫn sử dụng Cổng Luyện Thi Thông Minh"
    >
      {/* Lớp nền tối mờ (bấm vào vùng tối cũng cho phép đóng nhanh, giữ sắc nét vùng Spotlight) */}
      <div
        className="fixed inset-0 bg-slate-950/65 transition-opacity duration-300"
        onClick={handleDismiss}
      />

      {/* Viền Spotlight phát sáng quanh phần tử đang được giới thiệu */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-[121] rounded-2xl border-2 border-cyan-400 shadow-[0_0_0_4px_rgba(0,184,221,0.22),0_0_35px_rgba(0,184,221,0.45)] transition-all duration-300 ease-out"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
          }}
        >
          <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
            Vùng tương tác #{currentStep + 1}
          </span>
        </div>
      )}

      {/* Hộp thoại Hướng dẫn cố định góc dưới / giữa màn hình (Đảm bảo Zero Horizontal Scroll trên Mobile) */}
      <div className="fixed inset-x-0 bottom-3 sm:bottom-6 z-[122] px-3 sm:px-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.75),0_0_30px_rgba(0,184,221,0.2)] p-4 sm:p-6 text-white backdrop-blur-xl">
          {/* Thanh tiêu đề + Nút Bỏ qua hướng dẫn (Skip) luôn hiển thị ở mọi bước */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 shrink-0">
                {step.icon}
              </span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 break-words">
                {step.badge}
              </span>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              data-testid="tour-skip-button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-rose-500/20 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/40 text-xs font-bold transition-all cursor-pointer shrink-0"
              title="Đóng hướng dẫn ngay (Phím tắt: ESC)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bỏ qua hướng dẫn (ESC)</span>
            </button>
          </div>

          {/* Nội dung chính kèm linh vật Robot Schoolify */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 p-2 shrink-0">
              <Bot className="w-11 h-11 text-cyan-400 drop-shadow-[0_4px_12px_rgba(0,184,221,0.45)]" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-extrabold text-white mb-1.5 break-words">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3 break-words">
                {step.description}
              </p>
              <ul className="space-y-1.5">
                {step.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs sm:text-sm text-slate-200 bg-slate-800/60 border border-slate-700/70 rounded-xl px-3 py-2 break-words"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="min-w-0 break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Thanh điều hướng bước (flex-wrap chống tràn ngang tuyệt đối trên Mobile) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800">
            {/* Dots tiến độ */}
            <div className="flex flex-wrap items-center gap-1.5">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(idx)}
                  aria-label={`Chuyển đến bước ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? 'w-7 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]'
                      : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>

            {/* Nút Quay lại / Tiếp theo / Bắt đầu */}
            <div className="flex flex-wrap items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold border border-slate-700 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>
              )}

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1))}
                  data-testid="tour-next-button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  <span>Tiếp theo ({currentStep + 1}/{TOUR_STEPS.length})</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDismiss}
                  data-testid="tour-finish-button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt đầu trải nghiệm ngay!</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
