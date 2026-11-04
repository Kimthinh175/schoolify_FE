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
  Smile,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { SchoolifyRobot, type RobotEmotion } from './SchoolifyRobot';
import { clampEmotionDuration, isRobotEmotion } from '@/lib/robot-emotions';
import { NgocIcon } from '@/components/ui/point-icons';
import { AgentChatMessageContent } from './AgentChatMessageContent';
import { OutOfPointsModal } from '@/components/features/student/practice/OutOfPointsModal';
import { getCachedPointsBalance } from '@/services/exam-points.service';

export const ROBOT_EMOTIONS: { id: RobotEmotion; label: string; icon: string; desc: string }[] = [
  { id: 'default', label: 'Mặc định', icon: '🤖', desc: 'Chế độ chờ tương tác' },
  { id: 'happy', label: 'Vui vẻ', icon: '😄', desc: 'Mắt cong cười híp, má hồng' },
  { id: 'excited', label: 'Phấn khích', icon: '🤩', desc: 'Mắt nheo > < reo hò' },
  { id: 'wink', label: 'Nháy mắt', icon: '😉', desc: 'Nháy mắt, sao lấp lánh ✨' },
  { id: 'thinking', label: 'Suy nghĩ', icon: '🤔', desc: 'Chống cằm, dấu hỏi ?' },
  { id: 'idea', label: 'Ý tưởng', icon: '💡', desc: 'Bóng đèn phát sáng, vẫy tay' },
  { id: 'love', label: 'Yêu thích', icon: '😍', desc: 'Mắt trái tim, ôm cằm ❤️' },
  { id: 'celebrate', label: 'Ăn mừng', icon: '🎉', desc: 'Giơ tay reo hò, confetti' },
  { id: 'sad', label: 'Buồn bã', icon: '🥺', desc: 'Mắt rũ, giọt nước mắt 💧' },
  { id: 'angry', label: 'Tức giận', icon: '😤', desc: 'Mắt xếch, gân giận đỏ 💢' },
  { id: 'sleeping', label: 'Đi ngủ', icon: '😴', desc: 'Mắt nhắm thư thái, z z Z 💤' },
  { id: 'surprised', label: 'Kinh ngạc', icon: '😲', desc: 'Mắt tròn xoe O O, há hốc' },
  { id: 'stunned', label: 'Distorted Face', icon: '🥴', desc: 'Mắt phình to méo mó, mặt biến dạng' },
];

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
  pointUsage?: {
    tokensUsed: number;
    pointsDeducted: number;
    remainingDiamonds: number;
    hasDiscount?: boolean;
    activePackage?: string;
  };
  isError?: boolean;
}

const STARTER_SUGGESTIONS = [
  '🏫 Nền tảng Schoolify là gì?',
  '📐 Công thức nghiệm bậc hai',
  '🎯 Tạo đề Toán 12 khó 10 câu',
  '💡 Gợi ý bước giải cực trị',
  '💳 Gói học sinh 50k & 100k',
];

const SESSION_KEY = 'schoolify_chat_session_key';

const WELCOME_MESSAGE: ChatMessage = {
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
};

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
  const [emotion, setEmotion] = React.useState<RobotEmotion>('default');
  const [showEmotionPicker, setShowEmotionPicker] = React.useState(false);
  const [showShowcaseModal, setShowShowcaseModal] = React.useState(false);
  const emotionTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const triggerTemporaryEmotion = React.useCallback(
    (newEmotion: RobotEmotion, durationMs = 3500, fallbackEmotion: RobotEmotion = 'default') => {
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current);
      setEmotion(newEmotion);
      emotionTimerRef.current = setTimeout(() => {
        setEmotion(fallbackEmotion);
      }, durationMs);
    },
    []
  );

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
      setEmotion('surprised');
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
      triggerTemporaryEmotion('happy', 2000);
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
  const [sessionId, setSessionId] = React.useState<string>('');
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [executingActionIdx, setExecutingActionIdx] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>(STARTER_SUGGESTIONS);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME_MESSAGE]);

  // Khôi phục Session Cache từ Postgres DB khi mở ứng dụng (Chuẩn cho-cong-nghe)
  React.useEffect(() => {
    let curSession = '';
    try {
      curSession = localStorage.getItem(SESSION_KEY) || '';
      if (!curSession) {
        curSession = `sess-scl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        localStorage.setItem(SESSION_KEY, curSession);
      }
      setSessionId(curSession);

      fetch(`/api/v1/agent/chat/session/${encodeURIComponent(curSession)}`)
        .then((r) => r.json())
        .then((res) => {
          const history = res?.data?.messages;
          if (Array.isArray(history) && history.length > 0) {
            const sanitized = history.map((m: any, idx: number) => ({
              ...m,
              id: m.id ? String(m.id) : `hist-${idx}-${Date.now()}`,
              timestamp: m.timestamp || 'Trước đây',
            }));
            setMessages(sanitized);
            const lastMsg = history[history.length - 1];
            if (Array.isArray(lastMsg?.suggestions) && lastMsg.suggestions.length > 0) {
              setSuggestions(lastMsg.suggestions);
            }
          }
        })
        .catch(() => {});
    } catch {}
  }, []);

  const handleStartNewChat = async () => {
    if (sessionId) {
      fetch(`/api/v1/agent/chat/session/${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    }
    const newSess = `sess-scl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      localStorage.setItem(SESSION_KEY, newSess);
    } catch {}
    setSessionId(newSess);
    setMessages([WELCOME_MESSAGE]);
    setSuggestions(STARTER_SUGGESTIONS);
    setEmotion('happy');
    toast.success('Đã bắt đầu cuộc trò chuyện mới! 🚀', {
      description: 'Ngữ cảnh và lịch sử cũ đã được lưu trữ an toàn trong hệ thống.',
    });
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending]);

  const sendMessage = React.useCallback(
    async (textToSend?: string, customQuestionContext?: Record<string, any>) => {
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
      setEmotion('thinking');

      let effectiveUserId = 'usr-student-01';
      try {
        const raw =
          typeof window !== 'undefined' ? window.localStorage.getItem('schoolify-auth-storage') : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          effectiveUserId = parsed?.state?.user?.id || 'usr-student-01';
        }
      } catch {}

      // Multi-turn context memory: truyền 10 tin nhắn gần nhất
      const historyContext = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch('/api/v1/agent/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': effectiveUserId,
          },
          body: JSON.stringify({
            sessionId,
            userId: effectiveUserId,
            message: query,
            history: historyContext,
            currentUrl: pathname || '/',
            subject: customQuestionContext?.subjectSlug || 'toan-hoc',
            grade: customQuestionContext?.grade || 12,
            questionContext: customQuestionContext,
          }),
        });

        const json = await res.json();

        // Xử lý khi học sinh không đủ Ngọc Tri Thức
        if (!json?.success && json?.errorCode === 'INSUFFICIENT_XIN_POINTS') {
          const errAiMsg: ChatMessage = {
            id: `ai-err-${Date.now()}`,
            role: 'assistant',
            content: json.message || 'Bạn không đủ Ngọc Tri Thức (💎) để hỏi Gia sư AI.',
            timestamp: new Date().toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            isError: true,
            actions: [
              {
                type: 'NAVIGATE',
                payload: {
                  url: '/student/practice',
                  label: '🎯 Luyện đề để cày Ngọc Tri Thức miễn phí (> 8.5đ)',
                },
              },
              {
                type: 'NAVIGATE',
                payload: { url: '/pricing', label: '💳 Nâng cấp Gói học sinh (50k / 100k)' },
              },
            ],
          };
          setMessages((prev) => [...prev, errAiMsg]);
          triggerTemporaryEmotion('sad', 4000);
          return;
        }

        const payload = json?.data || json;
        const pointUsage = json?.pointUsage || payload?.pointUsage;

        if (pointUsage && typeof pointUsage.remainingDiamonds === 'number') {
          try {
            window.localStorage.setItem('schoolify_user_diamonds', String(pointUsage.remainingDiamonds));
            window.dispatchEvent(
              new CustomEvent('tokens-updated', { detail: { diamonds: pointUsage.remainingDiamonds } })
            );
          } catch {}
        }

        const actions = Array.isArray(payload?.actions) ? payload.actions : [];
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
          actions,
          pointUsage,
        };

        setMessages((prev) => [...prev, aiMsg]);
        if (Array.isArray(payload?.suggestions) && payload.suggestions.length > 0) {
          setSuggestions(payload.suggestions);
        }
        // Ưu tiên biểu cảm BE gửi kèm; thiếu/không hợp lệ thì tự suy luận
        if (isRobotEmotion(payload?.emotion)) {
          triggerTemporaryEmotion(payload.emotion, clampEmotionDuration(payload?.emotionDurationMs));
        } else if (actions.length > 0) {
          triggerTemporaryEmotion('idea', 4000);
        } else {
          triggerTemporaryEmotion('happy', 3500);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Hiện không kết nối được dịch vụ Trợ lý AI. Bạn vui lòng thử lại sau giây lát nhé!',
            timestamp: 'Vừa xong',
            isError: true,
          },
        ]);
        triggerTemporaryEmotion('sad', 4000);
      } finally {
        setIsSending(false);
      }
    },
    [input, isSending, messages, pathname, sessionId, triggerTemporaryEmotion]
  );

  // Lắng nghe sự kiện từ phòng luyện thi "💡 Hỏi Gia Sư AI câu này" (Context-Aware Socratic Tutor)
  React.useEffect(() => {
    const handleAskAiTutor = (e: Event) => {
      const customEvent = e as CustomEvent<Record<string, any>>;
      const detail = customEvent.detail || {};
      setIsOpen(true);
      setIsBubbleDismissed(true);
      setEmotion('idea');
      const promptText =
        detail.prompt ||
        `💡 Gợi mở Socratic câu "${detail.title || 'hiện tại'}" [${detail.topicTag || 'Chuyên đề'}]`;
      sendMessage(promptText, detail);
    };

    window.addEventListener('schoolify:ask-ai-tutor', handleAskAiTutor);
    return () => window.removeEventListener('schoolify:ask-ai-tutor', handleAskAiTutor);
  }, [sendMessage]);

  const [outOfPointsModal, setOutOfPointsModal] = React.useState<{
    isOpen: boolean;
    currentPoints: number;
    requiredPoints: number;
  }>({
    isOpen: false,
    currentPoints: 0,
    requiredPoints: 3,
  });

  /**
   * Thực thi Client Tool Action trực tiếp trên giao diện FE
   */
  const executeClientAction = async (action: ClientToolAction, actionKey: string) => {
    setExecutingActionIdx(actionKey);
    try {
      if (action.type === 'CONFIGURE_EXAM_MATRIX') {
        const cachedPts = getCachedPointsBalance();
        if (cachedPts !== null && cachedPts < 3) {
          setOutOfPointsModal({
            isOpen: true,
            currentPoints: Math.max(0, cachedPts),
            requiredPoints: 3,
          });
          return;
        }

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

        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (data?.errorCode === 'INSUFFICIENT_EXAM_POINTS' || res.status === 400) {
            toast.error('Không đủ Tia Sáng tạo đề thi!', {
              description:
                data?.message ||
                'Bạn đã hết Tia Sáng hôm nay. Hãy nâng cấp gói học sinh để tiếp tục luyện đề!',
              action: {
                label: 'Nâng cấp gói',
                onClick: () => router.push('/pricing'),
              },
            });
            return;
          }
          toast.error('Không thể tạo đề thi ma trận', {
            description: data?.message || 'Vui lòng thử lại sau',
          });
          return;
        }

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
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3">
      {/* Nút Floating mở Chatbox: Mascot Robot HTML/CSS & Bóng Thoại Chào Mừng */}
      {!isOpen && (
        <div
          ref={launcherRef}
          data-chat-launcher
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
            data-chat-robot
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onPointerEnter={() => {
              if (!isDragging && emotion === 'default') {
                setEmotion('wink');
              }
            }}
            onPointerLeave={() => {
              if (!isDragging && emotion === 'wink') {
                setEmotion('default');
              }
            }}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              setIsOpen(true);
              setIsBubbleDismissed(false);
              triggerTemporaryEmotion('excited', 2200);
            }}
            aria-label="Mở Trợ lý AI Schoolify (nhấn giữ và kéo để di chuyển)"
            title="Bấm để hỏi gia sư AI · Kéo để di chuyển"
            style={{ touchAction: 'none' }}
            className={`relative flex flex-col items-center group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD] focus-visible:ring-offset-2 rounded-2xl shrink-0 ${
              isDragging
                ? 'cursor-grabbing scale-105'
                : 'cursor-grab animate-sf-robot-drift hover:[animation-play-state:paused] transition-transform hover:scale-105'
            }`}
          >
            <SchoolifyRobot
              size="lg"
              emotion={emotion}
              isFloating={!isDragging}
            />
          </button>
        </div>
      )}

      {/* Khung Chatbox + Robot đứng bên cạnh */}
      {isOpen && (
        <div data-chat-open className="flex items-end gap-2 lg:gap-3 animate-in fade-in slide-in-from-bottom-5 zoom-in-95 duration-300 ease-out">
          {/* Robot đứng cạnh khung chat (ẩn trên màn hẹp để không tràn ngang) */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setShowEmotionPicker(false);
            }}
            onPointerEnter={() => {
              if (emotion === 'default') setEmotion('wink');
            }}
            onPointerLeave={() => {
              if (emotion === 'wink') setEmotion('default');
            }}
            aria-label="Thu gọn Trợ lý AI Schoolify"
            title="Bấm để thu gọn khung chat"
            className={`${
              isExpanded ? 'hidden lg:flex' : 'hidden md:flex'
            } relative flex-col items-center shrink-0 select-none rounded-2xl cursor-pointer transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD] focus-visible:ring-offset-2 animate-in fade-in slide-in-from-right-4 duration-300`}
          >
            <SchoolifyRobot size="lg" emotion={emotion} isFloating />
          </button>

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
              <button
                type="button"
                onClick={() => setShowEmotionPicker(!showEmotionPicker)}
                className="relative shrink-0 p-0.5 rounded-xl hover:ring-2 hover:ring-[#00B8DD]/50 transition-all cursor-pointer"
                title="Bấm để mở bảng 12 cảm xúc AI"
              >
                <SchoolifyRobot size="md" statusBadge emotion={emotion} />
              </button>
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
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span>Trạng thái:</span>
                  <span className="text-[#5CE1FF] font-semibold">
                    {ROBOT_EMOTIONS.find((e) => e.id === emotion)?.icon}{' '}
                    {ROBOT_EMOTIONS.find((e) => e.id === emotion)?.label}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#5CE1FF] hover:bg-slate-800 transition-colors cursor-pointer"
                title="Bắt đầu đoạn chat mới (Làm mới phiên)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowEmotionPicker(!showEmotionPicker)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showEmotionPicker
                    ? 'text-[#00B8DD] bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Chọn cảm xúc Robot AI (13 trạng thái)"
              >
                <Smile className="w-4 h-4" />
              </button>
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

          {/* Menu chọn 13 Cảm Xúc Lõi AI (Showcase) */}
          {showEmotionPicker && (
            <div className="p-3 bg-slate-900 border-b border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  13 Trạng Thái Cảm Xúc Lõi AI
                </span>
                <button
                  type="button"
                  onClick={() => setShowShowcaseModal(true)}
                  className="px-2 py-0.5 rounded-md bg-[#00B8DD]/20 hover:bg-[#00B8DD]/30 text-[#5CE1FF] text-[10px] font-bold border border-[#00B8DD]/40 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Xem lưới biểu cảm</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {ROBOT_EMOTIONS.map((emo) => (
                  <button
                    key={emo.id}
                    type="button"
                    onClick={() => {
                      setEmotion(emo.id);
                      toast.success(`Đã chuyển cảm xúc AI: ${emo.icon} ${emo.label}`, {
                        description: emo.desc,
                      });
                    }}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      emotion === emo.id
                        ? 'bg-[#00B8DD]/25 border-[#00B8DD] text-[#5CE1FF] ring-1 ring-[#00B8DD]/50'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                    title={emo.desc}
                  >
                    <span className="text-base sm:text-lg mb-0.5">{emo.icon}</span>
                    <span className="text-[10px] font-bold tracking-tight truncate w-full">
                      {emo.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg, idx) => (
              <div
                key={msg.id ? `${msg.id}-${idx}` : `chat-msg-${idx}`}
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
                      <SchoolifyRobot
                        size="sm"
                        emotion={
                          msg.isError
                            ? 'sad'
                            : msg.actions && msg.actions.length > 0
                            ? 'idea'
                            : 'happy'
                        }
                      />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words ${
                      msg.role === 'user'
                        ? 'bg-[#00B8DD] text-white font-medium rounded-br-xs shadow-xs max-w-[85%]'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs shadow-xs max-w-[90%]'
                    }`}
                  >
                    <AgentChatMessageContent content={msg.content} role={msg.role} />

                    {/* Badge trừ Ngọc Tri Thức & Token tiêu thụ */}
                    {msg.pointUsage && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40">
                          <span>
                            <NgocIcon className="inline-block w-[1.1em] h-[1.1em] align-[-0.18em]" flat /> {msg.pointUsage.pointsDeducted > 0 ? '-' : ''}
                            {msg.pointUsage.pointsDeducted} Ngọc Tri Thức
                          </span>
                          {msg.pointUsage.hasDiscount && (
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-100/70 dark:bg-emerald-900/60 px-1 rounded">
                              -50% VIP
                            </span>
                          )}
                        </span>
                        <span className="text-slate-400 font-medium">
                          ({msg.pointUsage.tokensUsed.toLocaleString('vi-VN')} tokens) • Còn {msg.pointUsage.remainingDiamonds} <NgocIcon className="inline-block w-[1.1em] h-[1.1em] align-[-0.18em]" flat />
                        </span>
                      </div>
                    )}

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

                            if (act.type === 'NAVIGATE') {
                              return (
                                <button
                                  key={actionKey}
                                  type="button"
                                  onClick={() => router.push(act.payload?.url || '/')}
                                  className="w-full p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-amber-500/10 hover:from-cyan-500/20 hover:to-amber-500/20 border border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between gap-2"
                                >
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                    {act.payload?.label || 'Chuyển trang'}
                                  </span>
                                  <ArrowRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
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
            {/* Trạng thái AI đang suy nghĩ (Thinking State Animation) */}
            {isSending && (
              <div className="flex flex-col items-start animate-in fade-in duration-200">
                <div className="mb-1 text-[10px] text-slate-400 px-1 select-none">
                  Đang phân tích...
                </div>
                <div className="flex items-start gap-2 w-full justify-start">
                  <div className="shrink-0 mt-0.5">
                    <SchoolifyRobot size="sm" emotion="thinking" />
                  </div>
                  <div className="rounded-2xl px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs shadow-xs">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>Schoolify AI đang tư duy</span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00B8DD] animate-bounce" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Danh sách Gợi ý ngữ cảnh thông minh (Dynamic Contextual Suggestions) - flex-wrap, không scroll ngang */}
          {suggestions.length > 0 && (
            <div className="px-3 py-2 bg-slate-50/80 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#00B8DD]" />
                  <span>Gợi ý:</span>
                </span>
                {suggestions.map((sug, idx) => (
                  <button
                    key={`${sug}-${idx}`}
                    type="button"
                    disabled={isSending}
                    onClick={() => sendMessage(sug)}
                    className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-[#00B8DD]/15 dark:hover:bg-[#00B8DD]/25 text-slate-700 dark:text-slate-200 hover:text-[#007D99] dark:hover:text-[#5CE1FF] text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700/80 shadow-2xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

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
        </div>
      )}

      {/* Modal Showcase Bảng Lưới 12 Biểu Cảm Hologram */}
      {showShowcaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#090D16] border border-[#00B8DD]/30 rounded-3xl shadow-2xl overflow-hidden text-white">
            {/* Header Modal */}
            <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-[#0A101D] to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Bộ Sưu Tập Biểu Cảm Robot Schoolify (13 Trạng Thái)</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Thiết kế Vector SVG Hologram lơ lửng với 13 sắc thái cảm xúc sống động
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShowcaseModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Đóng bảng mẫu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 12 Biểu Cảm (3x4 responsive, flex-wrap, no horizontal scroll) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 pb-8">
                {ROBOT_EMOTIONS.map((emo) => (
                  <div
                    key={emo.id}
                    className={`flex flex-col items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      emotion === emo.id
                        ? 'bg-slate-900/90 border-[#00B8DD] ring-2 ring-[#00B8DD]/40 shadow-lg shadow-[#00B8DD]/10'
                        : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="w-full flex items-center justify-center py-2 min-h-[140px]">
                      <SchoolifyRobot size="lg" emotion={emo.id} isFloating />
                    </div>
                    <div className="w-full text-center mt-2 border-t border-slate-800/80 pt-2.5">
                      <div className="flex items-center justify-center gap-1 text-sm font-bold text-slate-100">
                        <span>{emo.icon}</span>
                        <span>{emo.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {emo.desc}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEmotion(emo.id);
                          toast.success(`Đã chọn cảm xúc: ${emo.icon} ${emo.label}`);
                          setShowShowcaseModal(false);
                        }}
                        className={`mt-2.5 w-full py-1.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          emotion === emo.id
                            ? 'bg-[#00B8DD] text-white shadow-xs'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        }`}
                      >
                        {emotion === emo.id ? 'Đang kích hoạt' : 'Chọn cảm xúc'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <OutOfPointsModal
        isOpen={outOfPointsModal.isOpen}
        onClose={() => setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }))}
        currentPoints={outOfPointsModal.currentPoints}
        requiredPoints={outOfPointsModal.requiredPoints}
        levelLabel="Tạo đề AI"
        onNavigatePricing={() => {
          setOutOfPointsModal((prev) => ({ ...prev, isOpen: false }));
          setIsOpen(false);
          router.push('/pricing');
        }}
      />
    </div>
  );
}
