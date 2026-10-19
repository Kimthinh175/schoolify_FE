'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sparkles,
  Send,
  X,
  Compass,
  Sliders,
  Lightbulb,
  FileText,
  CreditCard,
  Minimize2,
  Maximize2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { SchoolifyRobot } from './SchoolifyRobot';

interface ClientToolAction {
  type:
    | 'CONFIGURE_EXAM_MATRIX'
    | 'NAVIGATE_PAGE'
    | 'SELECT_PRICING_PLAN'
    | 'SOCRATIC_HINT'
    | 'OPEN_DOCX_SCANNER'
    | string;
  payload: Record<string, any>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: ClientToolAction[];
}

const QUICK_PROMPTS = [
  {
    label: '🏫 Nền tảng Schoolify là gì?',
    prompt: 'Nền tảng Schoolify là gì và có những tính năng nào?',
  },
  {
    label: '🎯 Tạo đề Toán 12 khó',
    prompt: 'Tạo đề Toán lớp 12 mức độ khó 10 câu',
  },
  {
    label: '💡 Gợi ý cực trị',
    prompt: 'Gợi ý bước giải bài toán cực trị hàm số bậc 3',
  },
  {
    label: '📄 Quét đề Word .docx',
    prompt: 'Mở công cụ quét đề thi file word docx sinh câu hỏi',
  },
  {
    label: '💳 Gói Pro & Bảng giá',
    prompt: 'Tư vấn gói đăng ký Pro luyện đề không giới hạn',
  },
];

export function AgenticChatWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isManagementRoute = Boolean(
    pathname?.startsWith('/admin') ||
      pathname?.startsWith('/school') ||
      pathname?.startsWith('/teacher')
  );
  const [isBubbleDismissed, setIsBubbleDismissed] = React.useState(isManagementRoute);

  // Vừa vào trang hiện 5s tự tắt bóng thoại
  React.useEffect(() => {
    if (isManagementRoute) {
      setIsBubbleDismissed(true);
      return;
    }

    setIsBubbleDismissed(false);
    const timer = setTimeout(() => {
      setIsBubbleDismissed(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [pathname, isManagementRoute]);

  // Kéo thả vị trí nút robot (offset so với góc dưới-phải mặc định)
  const POS_KEY = 'schoolify-chat-launcher-pos';
  const EDGE_GAP = 8;
  const launcherRef = React.useRef<HTMLDivElement>(null);
  const dragRef = React.useRef<{
    lastX: number;
    lastY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = React.useRef(false);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);

  const clampDelta = React.useCallback((dx: number, dy: number) => {
    const el = launcherRef.current;
    if (!el) return { dx, dy };
    const rect = el.getBoundingClientRect();
    const minDx = EDGE_GAP - rect.left;
    const maxDx = window.innerWidth - EDGE_GAP - rect.right;
    const minDy = EDGE_GAP - rect.top;
    const maxDy = window.innerHeight - EDGE_GAP - rect.bottom;
    return {
      dx: Math.min(Math.max(dx, minDx), Math.max(minDx, maxDx)),
      dy: Math.min(Math.max(dy, minDy), Math.max(minDy, maxDy)),
    };
  }, []);

  // Khôi phục vị trí đã lưu
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved?.x === 'number' && typeof saved?.y === 'number') {
        setOffset({ x: saved.x, y: saved.y });
        setIsBubbleDismissed(true);
      }
    } catch {
      /* bỏ qua dữ liệu lỗi */
    }
  }, []);

  // Giữ robot trong màn hình khi đổi kích thước cửa sổ
  React.useEffect(() => {
    const handleResize = () => {
      const { dx, dy } = clampDelta(0, 0);
      if (dx !== 0 || dy !== 0) {
        setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [clampDelta, isOpen]);

  const handleDragStart = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      lastX: e.clientX,
      lastY: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    suppressClickRef.current = false;
  };

  const handleDragMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    if (
      !drag.moved &&
      Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 5
    ) {
      return;
    }
    if (!drag.moved) {
      drag.moved = true;
      setIsDragging(true);
      setIsBubbleDismissed(true);
    }
    const { dx, dy } = clampDelta(e.clientX - drag.lastX, e.clientY - drag.lastY);
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (drag?.moved) {
      suppressClickRef.current = true;
      setIsDragging(false);
      setOffset((current) => {
        try {
          localStorage.setItem(POS_KEY, JSON.stringify(current));
        } catch {
          /* bỏ qua */
        }
        return current;
      });
    }
  };

  // Chat state
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [executingActionIdx, setExecutingActionIdx] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Chào bạn! Tớ là **Trợ lý AI Schoolify** 🤖✨\n\nTớ có thể đồng hành cùng bạn:\n1. 🏫 **Tìm hiểu nền tảng Schoolify**: Khám phá hệ thống luyện thi K-12 thích ứng.\n2. 🎯 **Tạo đề thi thích ứng theo ma trận**: Ví dụ *"Tạo đề Toán 12 mức độ khó 10 câu"*.\n3. 💡 **Gợi mở Socratic từng bước**: Giúp bạn tự tư duy giải quyết bài toán khó.\n4. 💳 **Tư vấn gói học Pro & Bảng giá**: Lựa chọn gói luyện thi phù hợp.\n\nBạn cần hỗ trợ gì cứ nhắn cho tớ nhé!',
      timestamp: 'Vừa xong',
      actions: [
        {
          type: 'NAVIGATE_PAGE',
          payload: {
            path: '/luyen-thi',
            label: 'Khám Phá Cổng Luyện Thi K-12',
          },
        },
        {
          type: 'CONFIGURE_EXAM_MATRIX',
          payload: {
            subject: 'Toán học',
            grade: 12,
            bloomRatio: { NHAN_BIET: 30, THONG_HIEU: 40, VAN_DUNG: 20, VAN_DUNG_CAO: 10 },
            durationMinutes: 25,
            totalQuestions: 10,
          },
        },
      ],
    },
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/v1/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          currentUrl: pathname || '/',
          subject: 'toan-hoc',
          grade: 12,
        }),
      });

      const json = await res.json();
      const payload = json?.data || json;

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content:
          payload?.message ||
          'Tớ đã ghi nhận yêu cầu của bạn. Bạn hãy xem gợi ý thao tác bên dưới nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        actions: Array.isArray(payload?.actions) ? payload.actions : [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Hiện không kết nối được dịch vụ Trợ lý AI. Bạn vui lòng thử lại sau giây lát nhé!',
          timestamp: 'Vừa xong',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Thực thi Client Tool Action trực tiếp trên giao diện FE
   */
  const executeClientAction = async (action: ClientToolAction, actionKey: string) => {
    setExecutingActionIdx(actionKey);
    try {
      if (action.type === 'CONFIGURE_EXAM_MATRIX') {
        const {
          subject = 'Toán học',
          grade = 12,
          bloomRatio = { NHAN_BIET: 30, THONG_HIEU: 40, VAN_DUNG: 20, VAN_DUNG_CAO: 10 },
          totalQuestions = 10,
        } = action.payload || {};

        const res = await fetch('/api/v1/exams/matrix-generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: subject.toLowerCase().includes('lý')
              ? 'vat-ly'
              : subject.toLowerCase().includes('hóa')
                ? 'hoa-hoc'
                : 'toan-hoc',
            grade: Number(grade),
            totalQuestions: Number(totalQuestions),
            bloomPercentages: bloomRatio,
          }),
        });

        const data = await res.json();
        const generatedCount = data?.data?.questions?.length || totalQuestions;

        toast.success(`Đã khởi tạo đề ${subject} Khối ${grade} (${generatedCount} câu)!`, {
          description: `Ma trận Bloom: NB ${bloomRatio.NHAN_BIET}% • TH ${bloomRatio.THONG_HIEU}% • VD ${bloomRatio.VAN_DUNG}% • VDC ${bloomRatio.VAN_DUNG_CAO}%`,
        });

        router.push(
          `/student/practice/exam-room?subject=${encodeURIComponent(subject)}&grade=${grade}&count=${totalQuestions}`
        );
      } else if (action.type === 'NAVIGATE_PAGE') {
        const targetPath = action.payload?.path || '/luyen-thi';
        toast.info(`Trợ lý AI đang dẫn đường tới: ${targetPath}`);
        router.push(targetPath);
      } else if (action.type === 'SELECT_PRICING_PLAN') {
        const plan = action.payload?.plan || 'PRO';
        toast.success(`Đã chọn gói ${plan}! Đang chuyển tới trang Bảng Giá...`);
        router.push(`/pricing?plan=${plan}`);
      } else if (action.type === 'OPEN_DOCX_SCANNER') {
        toast.success('Đang mở AI Quét Đề Thi (.docx)...');
        router.push('/admin/questions/import');
      } else if (action.type === 'SOCRATIC_HINT') {
        toast.info(action.payload?.hintTitle || 'Đã mở gợi ý phương pháp Socratic!');
      }
    } catch (error: any) {
      toast.error('Không thể thực thi thao tác tự động', {
        description: error?.message,
      });
    } finally {
      setExecutingActionIdx(null);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* Nút Floating mở Chatbox: Mascot Robot HTML/CSS & Bóng Thoại Chào Mừng */}
      {!isOpen && (
        <div
          ref={launcherRef}
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
          className="relative flex flex-col sm:flex-row items-end sm:items-center gap-2.5 sm:gap-3"
        >
          {/* Bóng thoại chào mừng (Vừa vào trang hiện 5s tự tắt) */}
          {!isBubbleDismissed && (
            <div className="relative animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-[260px] sm:max-w-[295px] bg-white dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-2xl text-slate-800 dark:text-slate-100">
              {/* Mũi tên tam giác chỉ sang Robot (Desktop) */}
              <div className="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-l-[8px] border-l-white dark:border-l-slate-900 drop-shadow-xs" />
              {/* Mũi tên tam giác chỉ xuống Robot (Mobile) */}
              <div className="sm:hidden absolute -bottom-2 right-6 w-0 h-0 border-x-[7px] border-x-transparent border-t-[8px] border-t-white dark:border-t-slate-900 drop-shadow-xs" />

              {/* Nút tắt bóng thoại */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBubbleDismissed(true);
                }}
                aria-label="Đóng bóng thoại"
                title="Đóng bóng thoại"
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center text-xs cursor-pointer shadow-sm border border-slate-300/80 dark:border-slate-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>

              {/* Nội dung bóng thoại */}
              <div
                onClick={() => setIsOpen(true)}
                className="cursor-pointer space-y-2 select-none"
              >
                <p className="text-xs sm:text-[13px] leading-relaxed">
                  Xin chào 👋 Tớ là <strong className="text-[#007D99] dark:text-[#00B8DD] font-black">Trợ lý AI Schoolify</strong>. Bạn cần giải bài tập, tạo đề thi hay hỏi về nền tảng, cứ nhắn tớ nhé!
                </p>

                {/* Các nút gợi ý nhanh */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(true);
                      sendMessage('Tạo đề thi thử môn Toán lớp 12');
                    }}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#00B8DD]/10 hover:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30 transition-all cursor-pointer"
                  >
                    ⚡ Tạo đề thi thử
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(true);
                      sendMessage('Nền tảng Schoolify là gì và có những tính năng nào?');
                    }}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    🏫 Nền tảng Schoolify
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Linh vật Robot: bấm để mở chat, nhấn giữ và kéo để di chuyển */}
          <button
            type="button"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              setIsOpen(true);
              setIsBubbleDismissed(false);
            }}
            aria-label="Mở Trợ lý AI Schoolify (nhấn giữ và kéo để di chuyển)"
            title="Bấm để hỏi gia sư AI · Kéo để di chuyển"
            style={{ touchAction: 'none' }}
            className={`relative flex flex-col items-center group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD] focus-visible:ring-offset-2 rounded-2xl shrink-0 ${
              isDragging
                ? 'cursor-grabbing scale-105'
                : 'cursor-grab transition-transform hover:scale-105'
            }`}
          >
            <SchoolifyRobot
              size="lg"
              isFloating={!isDragging}
              showLabel
              labelText="Hỏi gia sư AI"
            />
          </button>
        </div>
      )}

      {/* Khung Chatbox */}
      {isOpen && (
        <div
          className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
            isExpanded
              ? 'w-[calc(100vw-2rem)] sm:w-[580px] h-[82vh] max-h-[760px]'
              : 'w-[calc(100vw-2rem)] sm:w-[430px] h-[74vh] max-h-[640px]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-[#090D16] to-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <SchoolifyRobot size="md" statusBadge />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black tracking-tight truncate flex items-center gap-1">
                    <span>Trợ Lý AI Schoolify</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold">
                    Đang hoạt động
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Bạn đồng hành học tập K-12 • Phản hồi 24/7
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Thời gian tin nhắn */}
                <div className="mb-1 text-[10px] text-slate-400 px-1 select-none">
                  {msg.timestamp}
                </div>

                {/* Bong bóng nội dung */}
                <div
                  className={`flex items-start gap-2 w-full ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="shrink-0 mt-0.5">
                      <SchoolifyRobot size="sm" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words ${
                      msg.role === 'user'
                        ? 'bg-[#00B8DD] text-white font-medium rounded-br-xs shadow-xs max-w-[85%]'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs shadow-xs max-w-[90%]'
                    }`}
                  >
                    <div className="whitespace-pre-line break-words">{msg.content}</div>

                    {/* Danh sách Client Tool Actions đính kèm */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          💡 Gợi ý thao tác:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.actions.map((act, idx) => {
                            const actionKey = `${msg.id}-${idx}`;
                            const isBusy = executingActionIdx === actionKey;

                            if (act.type === 'CONFIGURE_EXAM_MATRIX') {
                              return (
                                <button
                                  key={actionKey}
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => executeClientAction(act, actionKey)}
                                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#00B8DD]/10 to-emerald-500/10 hover:from-[#00B8DD]/20 hover:to-emerald-500/20 border border-[#00B8DD]/40 text-left transition-all cursor-pointer flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0">
                                    <p className="text-xs font-black text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                                      <Sliders className="w-3.5 h-3.5 shrink-0" />
                                      <span>
                                        Sinh Đề {act.payload?.subject || 'Toán'} Khối{' '}
                                        {act.payload?.grade || 12} (
                                        {act.payload?.totalQuestions || 10} câu)
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                      NB {act.payload?.bloomRatio?.NHAN_BIET}% • TH{' '}
                                      {act.payload?.bloomRatio?.THONG_HIEU}% • VD{' '}
                                      {act.payload?.bloomRatio?.VAN_DUNG}% • VDC{' '}
                                      {act.payload?.bloomRatio?.VAN_DUNG_CAO}%
                                    </p>
                                  </div>
                                  <span className="px-2.5 py-1.5 rounded-lg bg-[#00B8DD] text-white font-bold text-[11px] shrink-0 flex items-center gap-1">
                                    {isBusy ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <>
                                        <span>Tạo &amp; Thi</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </>
                                    )}
                                  </span>
                                </button>
                              );
                            }

                            if (act.type === 'NAVIGATE_PAGE') {
                              return (
                                <button
                                  key={actionKey}
                                  type="button"
                                  onClick={() => executeClientAction(act, actionKey)}
                                  className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#00B8DD] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                >
                                  <Compass className="w-3.5 h-3.5 text-[#00B8DD]" />
                                  <span>
                                    {act.payload?.label || `Đi tới ${act.payload?.path}`}
                                  </span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              );
                            }

                            if (act.type === 'OPEN_DOCX_SCANNER') {
                              return (
                                <button
                                  key={actionKey}
                                  type="button"
                                  onClick={() => executeClientAction(act, actionKey)}
                                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Mở AI Quét Đề Word (.docx)</span>
                                </button>
                              );
                            }

                            if (act.type === 'SELECT_PRICING_PLAN') {
                              return (
                                <button
                                  key={actionKey}
                                  type="button"
                                  onClick={() => executeClientAction(act, actionKey)}
                                  className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>
                                    Chọn Gói {act.payload?.plan || 'PRO'} &amp; Thanh Toán VietQR
                                  </span>
                                </button>
                              );
                            }

                            return (
                              <button
                                key={actionKey}
                                type="button"
                                onClick={() => executeClientAction(act, actionKey)}
                                className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>{act.payload?.hintTitle || 'Xem gợi mở Socratic'}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Danh sách Gợi ý nhanh (flex-wrap, không scroll ngang) */}
          <div className="px-3 py-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  disabled={isSending}
                  onClick={() => sendMessage(q.prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#00B8DD]/15 dark:bg-slate-800 dark:hover:bg-[#00B8DD]/20 text-slate-700 dark:text-slate-300 hover:text-[#007D99] dark:hover:text-[#00B8DD] text-[11px] font-semibold transition-all cursor-pointer shrink-0"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ô nhập câu hỏi */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhắn cho tớ (VD: Nền tảng này là gì, Tạo đề Toán 12...)"
              className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD]"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="p-2.5 rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold disabled:opacity-40 transition-all cursor-pointer shrink-0"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
