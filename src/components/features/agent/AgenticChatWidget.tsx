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
  RotateCcw,
  PanelLeft,
  Plus,
  Search,
  Pin,
  Pencil,
  Trash2,
  Check,
  Copy,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { SchoolifyRobot, type RobotEmotion } from './SchoolifyRobot';
import { clampEmotionDuration, isRobotEmotion } from '@/lib/robot-emotions';
import { NgocIcon } from '@/components/ui/point-icons';
import { AgentChatMessageContent } from './AgentChatMessageContent';
import {
  AgentReasoningProcess,
  type MessageThinking,
  deriveReasoningSteps,
} from './AgentReasoningProcess';
import { OutOfPointsModal } from '@/components/features/student/practice/OutOfPointsModal';
import { getCachedPointsBalance, examPointsService, notifyExamPointsUpdated } from '@/services/exam-points.service';
import { useAuthStore } from '@/store/auth.store';

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
    remainingDiamonds: number | null;
    hasDiscount?: boolean;
    activePackage?: string;
    isFree?: boolean;
    lowBalanceWarning?: boolean;
    isInterrupted?: boolean;
    tokensPaidFor?: number;
    warningMessage?: string;
    badge?: string;
  };
  isInterrupted?: boolean;
  interruptedContext?: {
    originalUserQuery: string;
    partialAssistantReply: string;
    remainingUnreleasedReply: string;
    interruptedAt?: string;
  };
  source?: string;
  vectorStats?: {
    tokenSavedPercent?: number;
    vectorComputeMs?: number;
    recalledCount?: number;
  };
  thinking?: MessageThinking;
  isError?: boolean;
}

interface SessionSummary {
  id: string;
  sessionKey: string;
  title: string;
  isPinned: boolean;
  messageCount: number;
  lastMessagePreview: string | null;
  updatedAt: string;
}

interface GroupedSessions {
  pinned: SessionSummary[];
  today: SessionSummary[];
  previous7Days: SessionSummary[];
  older: SessionSummary[];
}

const GEMINI_STARTER_CARDS = [
  {
    icon: '📐',
    title: 'Giải Toán & Công thức',
    desc: 'Phương trình bậc 2, Vi-ét, đạo hàm',
    prompt: 'Công thức nghiệm phương trình bậc hai và định lý Vi-ét kèm ví dụ dễ hiểu',
  },
  {
    icon: '🎯',
    title: 'Tạo đề luyện tập AI',
    desc: 'Sinh đề ma trận Bloom 10–50 câu',
    prompt: 'Tạo đề Toán 12 mức độ khó 10 câu bám sát cấu trúc mới',
  },
  {
    icon: '💡',
    title: 'Gợi mở Socratic',
    desc: 'Hướng dẫn tư duy từng bước giải',
    prompt: 'Gợi ý các bước tìm cực trị của hàm số bậc 3 Toán 12',
  },
  {
    icon: '🏫',
    title: 'Khám phá Schoolify',
    desc: 'Tìm hiểu tính năng & gói học (Miễn phí)',
    prompt: 'Nền tảng Schoolify là gì và có những tính năng nổi bật nào?',
  },
];

const DEFAULT_SUGGESTIONS = [
  '📐 Công thức nghiệm bậc hai',
  '🎯 Tạo đề Toán 12 khó 10 câu',
  '💡 Gợi ý bước giải cực trị',
  '🏫 Nền tảng Schoolify là gì?',
];

const SESSION_KEY = 'schoolify_chat_session_key';

export function AgenticChatWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isManagementRoute = Boolean(
    pathname?.startsWith('/admin') ||
      pathname?.startsWith('/school') ||
      pathname?.startsWith('/teacher')
  );
  const [isBubbleDismissed, setIsBubbleDismissed] = React.useState(isManagementRoute);
  const [emotion, setEmotion] = React.useState<RobotEmotion>('default');
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

  // Vừa vào trang hiện bóng thoại (chỉ trên desktop, tự tắt sau 4s hoặc khi cuộn trang)
  React.useEffect(() => {
    if (isManagementRoute) {
      setIsBubbleDismissed(true);
      return;
    }
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      setIsBubbleDismissed(true);
      return;
    }

    setIsBubbleDismissed(false);
    const timer = setTimeout(() => {
      setIsBubbleDismissed(true);
    }, 4000);

    const handleScroll = () => setIsBubbleDismissed(true);
    window.addEventListener('scroll', handleScroll, { passive: true, once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname, isManagementRoute]);

  // Kéo thả vị trí nút robot
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

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(POS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved?.x === 'number' && typeof saved?.y === 'number') {
        setOffset({ x: saved.x, y: saved.y });
        setIsBubbleDismissed(true);
      }
    } catch {}
  }, []);

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
    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 5) {
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
        } catch {}
        return current;
      });
    }
  };

  // Helper lấy thông tin xác thực hiện tại (userId + JWT token)
  const getAuthSession = React.useCallback((): {
    userId: string | null;
    token: string | null;
    isAuthenticated: boolean;
  } => {
    try {
      const raw =
        typeof window !== 'undefined' ? window.localStorage.getItem('schoolify-auth-storage') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const state = parsed?.state;
        const userId = state?.user?.id ? String(state.user.id) : null;
        const token = state?.token ? String(state.token) : null;
        const isAuthenticated = Boolean(state?.isAuthenticated && userId && userId !== 'usr-student-01');
        return {
          userId: isAuthenticated ? userId : null,
          token: isAuthenticated ? token : null,
          isAuthenticated,
        };
      }
    } catch {}
    return { userId: null, token: null, isAuthenticated: false };
  }, []);

  const buildAuthHeaders = React.useCallback(
    (includeJson = false): Record<string, string> => {
      const { userId, token } = getAuthSession();
      return {
        ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(userId ? { 'x-user-id': userId } : {}),
      };
    },
    [getAuthSession]
  );

  // Chat & Session state (Chuẩn Gemini Workspace)
  const [sessionId, setSessionId] = React.useState<string>('');
  const [currentSessionTitle, setCurrentSessionTitle] = React.useState<string>('Cuộc trò chuyện mới');
  const [sessions, setSessions] = React.useState<SessionSummary[]>([]);
  const [groupedSessions, setGroupedSessions] = React.useState<GroupedSessions>({
    pinned: [],
    today: [],
    previous7Days: [],
    older: [],
  });
  const [sessionSearch, setSessionSearch] = React.useState('');
  const [isLoadingSessions, setIsLoadingSessions] = React.useState(false);
  const [editingSessionKey, setEditingSessionKey] = React.useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = React.useState('');
  const [copiedMsgId, setCopiedMsgId] = React.useState<string | null>(null);

  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [sendingQuery, setSendingQuery] = React.useState<string>('');
  const [sendingQuestionContext, setSendingQuestionContext] = React.useState<
    Record<string, any> | undefined
  >(undefined);
  const sendStartTimeRef = React.useRef<number>(0);
  const [executingActionIdx, setExecutingActionIdx] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<string[]>(DEFAULT_SUGGESTIONS);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // Tải danh sách phiên trò chuyện từ PostgreSQL (chỉ khi đã đăng nhập)
  const fetchSessionList = React.useCallback(
    async (searchQuery = '') => {
      const { userId, isAuthenticated } = getAuthSession();
      if (!isAuthenticated || !userId) {
        setSessions([]);
        setGroupedSessions({ pinned: [], today: [], previous7Days: [], older: [] });
        return;
      }
      try {
        setIsLoadingSessions(true);
        const params = new URLSearchParams({ userId });
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        const res = await fetch(`/api/v1/agent/sessions?${params.toString()}`, {
          headers: buildAuthHeaders(false),
        });
        const json = await res.json();
        if (json?.success && json?.data) {
          setSessions(Array.isArray(json.data.sessions) ? json.data.sessions : []);
          if (json.data.grouped) {
            setGroupedSessions({
              pinned: json.data.grouped.pinned || [],
              today: json.data.grouped.today || [],
              previous7Days: json.data.grouped.previous7Days || [],
              older: json.data.grouped.older || [],
            });
          }
        }
      } catch {
        // Bỏ qua lỗi mạng tạm thời
      } finally {
        setIsLoadingSessions(false);
      }
    },
    [buildAuthHeaders, getAuthSession]
  );

  // Tải nội dung của 1 session cụ thể
  const loadSessionMessages = React.useCallback(
    async (targetKey: string) => {
      if (!targetKey) return;
      const { isAuthenticated } = getAuthSession();
      if (!isAuthenticated) {
        setMessages([]);
        setSuggestions(DEFAULT_SUGGESTIONS);
        return;
      }
      try {
        const res = await fetch(`/api/v1/agent/chat/session/${encodeURIComponent(targetKey)}`, {
          headers: buildAuthHeaders(false),
        });
        const json = await res.json();
        const history = json?.data?.messages;
        const sessMeta = json?.data?.session;

        if (sessMeta?.title) {
          setCurrentSessionTitle(sessMeta.title);
        } else {
          setCurrentSessionTitle('Cuộc trò chuyện mới');
        }

        if (Array.isArray(history) && history.length > 0) {
          const realMsgs = history
            .filter((m: any) => m.id !== 'welcome-msg')
            .map((m: any, idx: number) => ({
              ...m,
              id: m.id ? String(m.id) : `hist-${idx}-${Date.now()}`,
              timestamp: m.timestamp || 'Trước đây',
            }));
          setMessages(realMsgs);
          const lastMsg = realMsgs[realMsgs.length - 1];
          if (Array.isArray((lastMsg as any)?.suggestions) && (lastMsg as any).suggestions.length > 0) {
            setSuggestions((lastMsg as any).suggestions);
          } else {
            setSuggestions(DEFAULT_SUGGESTIONS);
          }
        } else {
          setMessages([]);
          setSuggestions(DEFAULT_SUGGESTIONS);
        }
      } catch {
        setMessages([]);
      }
    },
    [buildAuthHeaders, getAuthSession]
  );

  // Khởi tạo session khi mở ứng dụng
  React.useEffect(() => {
    try {
      let curSession = localStorage.getItem(SESSION_KEY) || '';
      if (!curSession) {
        curSession = `sess-scl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        localStorage.setItem(SESSION_KEY, curSession);
      }
      setSessionId(curSession);
      loadSessionMessages(curSession);
      fetchSessionList();
    } catch {}
  }, [fetchSessionList, loadSessionMessages]);

  // Tìm kiếm session có debounce nhẹ
  React.useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchSessionList(sessionSearch);
    }, 200);
    return () => clearTimeout(timer);
  }, [sessionSearch, isOpen, fetchSessionList]);

  // Tạo cuộc trò chuyện mới chuẩn Gemini (GIỮ NGUYÊN các phiên cũ trong PostgreSQL, không xóa!)
  const handleStartNewChat = React.useCallback(async () => {
    const newSessKey = `sess-scl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      localStorage.setItem(SESSION_KEY, newSessKey);
    } catch {}
    setSessionId(newSessKey);
    setCurrentSessionTitle('Cuộc trò chuyện mới');
    setMessages([]);
    setSuggestions(DEFAULT_SUGGESTIONS);
    setEmotion('happy');

    // Trên màn hình nhỏ, tự đóng drawer sidebar sau khi chọn tạo mới
    if (!isExpanded) {
      setIsSidebarOpen(false);
    }
  }, [isExpanded]);

  // Chuyển sang một session khác trong Sidebar
  const handleSelectSession = async (sess: SessionSummary) => {
    try {
      localStorage.setItem(SESSION_KEY, sess.sessionKey);
    } catch {}
    setSessionId(sess.sessionKey);
    setCurrentSessionTitle(sess.title || 'Cuộc trò chuyện');
    await loadSessionMessages(sess.sessionKey);
    if (!isExpanded) {
      setIsSidebarOpen(false);
    }
  };

  // Ghim / Bỏ ghim phiên trò chuyện
  const handleTogglePinSession = async (e: React.MouseEvent, sess: SessionSummary) => {
    e.stopPropagation();
    const nextPinned = !sess.isPinned;
    try {
      const res = await fetch(`/api/v1/agent/chat/session/${encodeURIComponent(sess.sessionKey)}`, {
        method: 'PATCH',
        headers: buildAuthHeaders(true),
        body: JSON.stringify({ isPinned: nextPinned }),
      });
      if (res.ok) {
        toast.success(nextPinned ? '📌 Đã ghim cuộc trò chuyện' : 'Đã bỏ ghim cuộc trò chuyện');
        fetchSessionList(sessionSearch);
      }
    } catch {}
  };

  // Lưu tên mới của phiên trò chuyện
  const handleSaveRenameSession = async (e: React.FormEvent | React.MouseEvent, sessKey: string) => {
    e.stopPropagation();
    const trimmed = editingTitleValue.trim();
    if (!trimmed) {
      setEditingSessionKey(null);
      return;
    }
    try {
      const res = await fetch(`/api/v1/agent/chat/session/${encodeURIComponent(sessKey)}`, {
        method: 'PATCH',
        headers: buildAuthHeaders(true),
        body: JSON.stringify({ title: trimmed }),
      });
      if (res.ok) {
        if (sessKey === sessionId) {
          setCurrentSessionTitle(trimmed);
        }
        setEditingSessionKey(null);
        fetchSessionList(sessionSearch);
      }
    } catch {
      setEditingSessionKey(null);
    }
  };

  // Xóa một phiên trò chuyện khỏi lịch sử
  const handleDeleteSession = async (e: React.MouseEvent, targetKey: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/v1/agent/chat/session/${encodeURIComponent(targetKey)}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(false),
      });
      toast.success('Đã xóa cuộc trò chuyện');
      if (targetKey === sessionId) {
        await handleStartNewChat();
      }
      fetchSessionList(sessionSearch);
    } catch {}
  };

  const handleCopyMessage = (msgId: string, content: string) => {
    try {
      navigator.clipboard.writeText(content);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 1800);
    } catch {}
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [remainingDiamondsBalance, setRemainingDiamondsBalance] = React.useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem('schoolify_user_diamonds');
      if (raw !== null && raw !== '') {
        const num = Number(raw);
        return Number.isFinite(num) ? num : null;
      }
    } catch {}
    return null;
  });

  React.useEffect(() => {
    const syncDiamonds = (e: Event) => {
      const customEvt = e as CustomEvent<{ diamonds?: number }>;
      if (typeof customEvt?.detail?.diamonds === 'number') {
        setRemainingDiamondsBalance(customEvt.detail.diamonds);
      } else {
        try {
          const raw = window.localStorage.getItem('schoolify_user_diamonds');
          if (raw !== null && raw !== '') {
            const num = Number(raw);
            if (Number.isFinite(num)) setRemainingDiamondsBalance(num);
          }
        } catch {}
      }
    };
    window.addEventListener('tokens-updated', syncDiamonds);
    return () => window.removeEventListener('tokens-updated', syncDiamonds);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending]);

  const sendMessage = React.useCallback(
    async (textToSend?: string, customQuestionContext?: Record<string, any>) => {
      const query = (textToSend ?? input).trim();
      if (!query || isSending) return;

      let activeSessKey = sessionId;
      if (!activeSessKey) {
        activeSessKey = `sess-scl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setSessionId(activeSessKey);
        try {
          localStorage.setItem(SESSION_KEY, activeSessKey);
        } catch {}
      }

      // Kiểm tra xem tin nhắn AI gần nhất có bị ngắt giữa chừng do hết Ngọc không để nối tiếp ngữ cảnh
      const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
      const pendingInterruptedContext =
        lastAssistantMsg?.isInterrupted && lastAssistantMsg?.interruptedContext
          ? lastAssistantMsg.interruptedContext
          : undefined;

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
      sendStartTimeRef.current = Date.now();
      setSendingQuery(query);
      setSendingQuestionContext(customQuestionContext);
      setIsSending(true);
      setEmotion('thinking');

      const { userId: verifiedLocalUserId } = getAuthSession();
      const historyContext = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch('/api/v1/agent/chat', {
          method: 'POST',
          headers: buildAuthHeaders(true),
          body: JSON.stringify({
            sessionId: activeSessKey,
            userId: verifiedLocalUserId,
            message: query,
            history: historyContext,
            currentUrl: pathname || '/',
            subject: customQuestionContext?.subjectSlug || 'toan-hoc',
            grade: customQuestionContext?.grade || 12,
            questionContext: customQuestionContext,
            ...(pendingInterruptedContext
              ? { context: { interruptedContext: pendingInterruptedContext } }
              : {}),
          }),
        });

        const json = await res.json();

        if (!json?.success && json?.errorCode === 'INSUFFICIENT_XIN_POINTS') {
          setRemainingDiamondsBalance(0);
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
          setRemainingDiamondsBalance(pointUsage.remainingDiamonds);
          try {
            window.localStorage.setItem('schoolify_user_diamonds', String(pointUsage.remainingDiamonds));
            window.dispatchEvent(
              new CustomEvent('tokens-updated', { detail: { diamonds: pointUsage.remainingDiamonds } })
            );
          } catch {}

          if (pointUsage.isInterrupted) {
            toast.error('Đã tạm dừng suy luận giữa chừng vì bạn vừa dùng hết Ngọc Tri Thức (0 💎)!');
          } else if (pointUsage.lowBalanceWarning) {
            toast.warning(
              `⚠️ Cảnh báo: Bạn chỉ còn ${pointUsage.remainingDiamonds} 💎 (≤ 1 Ngọc Tri Thức). Nếu hết Ngọc lúc đang giải, AI sẽ dừng giữa chừng!`
            );
          }
        }

        const durationSeconds = Math.max(
          0.6,
          Number(((Date.now() - sendStartTimeRef.current) / 1000).toFixed(1))
        );
        const thinking: MessageThinking = {
          durationSeconds,
          steps: deriveReasoningSteps(query, customQuestionContext),
          summary: `Đã hoàn tất 4 bước suy luận Socratic trong ${durationSeconds}s`,
        };

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
          thinking,
          isInterrupted: Boolean(payload?.isInterrupted || pointUsage?.isInterrupted),
          interruptedContext: payload?.interruptedContext,
          source: payload?.source,
          vectorStats: payload?.vectorMemoryStats,
        };

        setMessages((prev) => [...prev, aiMsg]);

        // Cập nhật tiêu đề session tự động từ Backend (giống Gemini)
        if (payload?.session?.title) {
          setCurrentSessionTitle(payload.session.title);
        } else if (currentSessionTitle === 'Cuộc trò chuyện mới') {
          const cleanTitle = query.replace(/^[\s💡🎯📐🏫💳⚡]+/u, '').trim().slice(0, 42);
          if (cleanTitle) setCurrentSessionTitle(cleanTitle);
        }

        // Làm mới danh sách session trong Sidebar
        fetchSessionList(sessionSearch);

        if (Array.isArray(payload?.suggestions) && payload.suggestions.length > 0) {
          setSuggestions(payload.suggestions);
        }
        if (isRobotEmotion(payload?.emotion)) {
          triggerTemporaryEmotion(payload.emotion, clampEmotionDuration(payload?.emotionDurationMs));
        } else if (actions.length > 0) {
          triggerTemporaryEmotion('idea', 4000);
        } else {
          triggerTemporaryEmotion('happy', 3500);
        }
      } catch {
        const durationSeconds = Math.max(
          0.6,
          Number(((Date.now() - sendStartTimeRef.current) / 1000).toFixed(1))
        );
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: 'Hiện không kết nối được dịch vụ Trợ lý AI. Bạn vui lòng thử lại sau giây lát nhé!',
            timestamp: 'Vừa xong',
            isError: true,
            thinking: {
              durationSeconds,
              steps: deriveReasoningSteps(query, customQuestionContext),
            },
          },
        ]);
        triggerTemporaryEmotion('sad', 4000);
      } finally {
        setIsSending(false);
        setSendingQuery('');
        setSendingQuestionContext(undefined);
      }
    },
    [
      buildAuthHeaders,
      currentSessionTitle,
      fetchSessionList,
      getAuthSession,
      input,
      isSending,
      messages,
      pathname,
      sessionId,
      sessionSearch,
      triggerTemporaryEmotion,
    ]
  );

  // Lắng nghe sự kiện từ phòng luyện thi "💡 Hỏi Gia Sư AI câu này"
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

  const executeClientAction = async (action: ClientToolAction, actionKey: string) => {
    setExecutingActionIdx(actionKey);
    try {
      if (action.type === 'CONFIGURE_EXAM_MATRIX') {
        const authState = useAuthStore.getState();
        if (!authState.isAuthenticated || !authState.user?.id) {
          toast.warning('Yêu cầu đăng nhập tài khoản!', {
            description: 'Bạn cần đăng nhập tài khoản học sinh để tạo đề thi mới.',
          });
          const returnUrl =
            typeof window !== 'undefined'
              ? window.location.pathname + window.location.search
              : '/luyen-thi';
          router.push(`/login/student?returnUrl=${encodeURIComponent(returnUrl)}`);
          return;
        }

        const isAdminUser =
          (authState.currentRole as string) === 'ADMIN' ||
          authState.currentRole === 'SUPER_ADMIN' ||
          (authState.user.role as string) === 'ADMIN' ||
          authState.user.role === 'SUPER_ADMIN';

        if (!isAdminUser) {
          const cachedPts = getCachedPointsBalance();
          if (cachedPts !== null && cachedPts < 3) {
            setOutOfPointsModal({
              isOpen: true,
              currentPoints: Math.max(0, cachedPts),
              requiredPoints: 3,
            });
            return;
          }

          const latestBal = await examPointsService.getBalance(authState.user.id);
          if (latestBal && typeof latestBal.currentPoints === 'number') {
            notifyExamPointsUpdated(latestBal.currentPoints);
            if (latestBal.currentPoints < 3) {
              setOutOfPointsModal({
                isOpen: true,
                currentPoints: Math.max(0, latestBal.currentPoints),
                requiredPoints: 3,
              });
              return;
            }
          }
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
            setOutOfPointsModal({
              isOpen: true,
              currentPoints: Math.max(0, Number(data?.data?.currentPoints ?? 0)),
              requiredPoints: Number(data?.data?.requiredPoints ?? 3),
            });
            return;
          }
          toast.error('Không thể tạo đề thi ma trận', {
            description: data?.message || 'Vui lòng thử lại sau',
          });
          return;
        }

        const generatedCount = data?.data?.questions?.length || totalQuestions;
        toast.success(`Đã khởi tạo đề ${subject} Khối ${grade} (${generatedCount} câu)!`);
        router.push(
          `/student/practice/exam-room?subject=${encodeURIComponent(subject)}&grade=${grade}&count=${totalQuestions}`
        );
      } else if (action.type === 'NAVIGATE_PAGE') {
        const targetPath = action.payload?.path || '/luyen-thi';
        router.push(targetPath);
      } else if (action.type === 'SELECT_PRICING_PLAN') {
        const plan = action.payload?.plan || 'PRO';
        router.push(`/pricing?plan=${plan}`);
      } else if (action.type === 'OPEN_DOCX_SCANNER') {
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

  // Render từng nhóm session trong Sidebar kiểu Gemini
  const renderSessionGroup = (label: string, list: SessionSummary[]) => {
    if (!list || list.length === 0) return null;
    return (
      <div className="space-y-1">
        <p className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
          {label}
        </p>
        {list.map((sess) => {
          const isActive = sess.sessionKey === sessionId;
          const isEditing = editingSessionKey === sess.sessionKey;

          return (
            <div
              key={sess.sessionKey}
              onClick={() => !isEditing && handleSelectSession(sess)}
              className={`group relative flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#5CE1FF] font-bold border border-[#00B8DD]/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {sess.isPinned ? (
                  <Pin className="w-3.5 h-3.5 text-[#00B8DD] shrink-0 fill-[#00B8DD]/20" />
                ) : (
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                )}

                {isEditing ? (
                  <form
                    onSubmit={(e) => handleSaveRenameSession(e, sess.sessionKey)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 flex-1 min-w-0"
                  >
                    <input
                      type="text"
                      value={editingTitleValue}
                      onChange={(e) => setEditingTitleValue(e.target.value)}
                      autoFocus
                      className="w-full min-w-0 px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-[#00B8DD] text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 shrink-0"
                      title="Lưu tên"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  <span className="truncate leading-snug">{sess.title}</span>
                )}
              </div>

              {!isEditing && (
                <div
                  className={`flex items-center gap-0.5 shrink-0 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
                  } transition-opacity`}
                >
                  <button
                    type="button"
                    onClick={(e) => handleTogglePinSession(e, sess)}
                    className={`p-1 rounded-md hover:bg-slate-300/60 dark:hover:bg-slate-700/80 transition-colors ${
                      sess.isPinned ? 'text-[#00B8DD]' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                    title={sess.isPinned ? 'Bỏ ghim' : 'Ghim cuộc trò chuyện'}
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSessionKey(sess.sessionKey);
                      setEditingTitleValue(sess.title);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-700/80 transition-colors"
                    title="Đổi tên"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(e, sess.sessionKey)}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Xóa cuộc trò chuyện"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const showSidebarPanel = isSidebarOpen || isExpanded;

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end">
      {/* 1. Nút Floating mở Chatbox khi đang đóng */}
      {!isOpen && (
        <div
          ref={launcherRef}
          data-chat-launcher
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
          className="relative flex flex-col sm:flex-row items-end sm:items-center gap-2.5"
        >
          {!isBubbleDismissed && (
            <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-[240px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 shadow-xl text-slate-800 dark:text-slate-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsBubbleDismissed(true);
                }}
                aria-label="Đóng bóng thoại"
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 flex items-center justify-center text-[10px] cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
              <div
                onClick={() => setIsOpen(true)}
                className="cursor-pointer select-none text-xs leading-snug"
              >
                <span className="font-bold text-[#007D99] dark:text-[#00B8DD]">Schoolify AI</span> sẵn sàng hỗ trợ giải bài &amp; tạo đề! ✨
              </div>
            </div>
          )}

          <button
            type="button"
            data-chat-robot
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
            onPointerEnter={() => {
              if (!isDragging && emotion === 'default') setEmotion('wink');
            }}
            onPointerLeave={() => {
              if (!isDragging && emotion === 'wink') setEmotion('default');
            }}
            onClick={() => {
              if (suppressClickRef.current) {
                suppressClickRef.current = false;
                return;
              }
              setIsOpen(true);
              setIsBubbleDismissed(true);
              fetchSessionList();
              triggerTemporaryEmotion('excited', 2000);
            }}
            aria-label="Mở Trợ lý AI Schoolify"
            title="Bấm để mở Schoolify AI · Kéo để di chuyển"
            style={{ touchAction: 'none' }}
            className={`relative flex flex-col items-center group select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00B8DD] rounded-2xl shrink-0 ${
              isDragging
                ? 'cursor-grabbing scale-105'
                : 'cursor-grab animate-sf-robot-drift hover:[animation-play-state:paused] transition-transform hover:scale-105'
            }`}
          >
            <SchoolifyRobot size="lg" emotion={emotion} isFloating={!isDragging} />
          </button>
        </div>
      )}

      {/* 2. Khung Chatbox Chuẩn Gemini (Clean UI + Quản lý đa Session + Vector Memory) */}
      {isOpen && (
        <div
          data-chat-open
          className={`relative flex flex-col bg-white dark:bg-[#0B111E] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isExpanded
              ? 'w-[calc(100vw-1.5rem)] sm:w-[820px] lg:w-[920px] h-[85vh] max-h-[760px]'
              : 'w-[calc(100vw-1.5rem)] sm:w-[430px] h-[75vh] max-h-[650px]'
          }`}
        >
          {/* Top Bar tinh gọn chuẩn Gemini */}
          <div className="h-13 px-3.5 bg-white/95 dark:bg-[#090D16] text-slate-900 dark:text-white flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                className={`p-2 rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  showSidebarPanel
                    ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#5CE1FF]'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Đóng/mở danh sách phiên trò chuyện (Gemini Sessions)"
                aria-label="Danh sách phiên trò chuyện"
              >
                <PanelLeft className="w-4 h-4" />
                {sessions.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#00B8DD]/20 text-[#007D99] dark:text-[#5CE1FF]">
                    {sessions.length}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#00B8DD]/20 to-cyan-500/5 border border-[#00B8DD]/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#00B8DD]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold tracking-tight text-slate-900 dark:text-white shrink-0">
                      Schoolify AI
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[175px] sm:max-w-[260px]">
                    {currentSessionTitle}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="px-2.5 py-1.5 rounded-xl bg-[#00B8DD]/10 hover:bg-[#00B8DD]/20 text-[#007D99] dark:text-[#5CE1FF] border border-[#00B8DD]/25 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Cuộc trò chuyện mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mới</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
                title={isExpanded ? 'Thu gọn cửa sổ' : 'Mở rộng chế độ Gemini Workspace'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: Split View (Sidebar trái kiểu Gemini + Khung hội thoại trung tâm) */}
          <div className="relative flex-1 flex min-h-0 overflow-hidden">
            {/* Backdrop khi mở Drawer Sidebar trên mobile hoặc chế độ thu gọn */}
            {isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className={`${
                  isExpanded ? 'sm:hidden' : ''
                } absolute inset-0 z-20 bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-150`}
              />
            )}

            {/* Gemini Left Sidebar: Quản lý Session + Tìm kiếm Ngữ nghĩa Vector */}
            {showSidebarPanel && (
              <aside
                className={`${
                  isSidebarOpen
                    ? isExpanded
                      ? 'flex absolute sm:relative inset-y-0 left-0 z-30 w-[255px] shrink-0 shadow-2xl sm:shadow-none'
                      : 'flex absolute inset-y-0 left-0 z-30 w-[255px] shrink-0 shadow-2xl'
                    : 'hidden sm:flex sm:relative sm:w-[255px] sm:shrink-0'
                } flex-col bg-slate-50 dark:bg-[#090D16] border-r border-slate-200/80 dark:border-slate-800/80 animate-in slide-in-from-left-2 duration-150`}
              >
                {/* Nút + Cuộc trò chuyện mới chuẩn Gemini */}
                <div className="p-3 space-y-2.5 border-b border-slate-200/70 dark:border-slate-800/70">
                  <button
                    type="button"
                    onClick={handleStartNewChat}
                    className="w-full py-2 px-3.5 rounded-full bg-[#00B8DD] hover:bg-[#00a3c4] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Cuộc trò chuyện mới</span>
                  </button>

                  {/* Ô tìm kiếm lịch sử theo từ khóa & Vector ngữ nghĩa */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      placeholder="Tìm lịch sử trò chuyện..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#00B8DD]"
                    />
                    {sessionSearch && (
                      <button
                        type="button"
                        onClick={() => setSessionSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Danh sách phiên trò chuyện phân nhóm */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {isLoadingSessions && sessions.length === 0 ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00B8DD]" />
                      <span>Đang đồng bộ phiên...</span>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="py-8 px-3 text-center space-y-1.5">
                      <MessageSquare className="w-6 h-6 text-slate-400 mx-auto opacity-60" />
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Chưa có lịch sử phiên
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Các cuộc trò chuyện của bạn sẽ tự động đặt tên và lưu tại đây giống Gemini.
                      </p>
                    </div>
                  ) : (
                    <>
                      {renderSessionGroup('📌 Đã ghim', groupedSessions.pinned)}
                      {renderSessionGroup('Hôm nay', groupedSessions.today)}
                      {renderSessionGroup('7 ngày trước', groupedSessions.previous7Days)}
                      {renderSessionGroup('Cũ hơn', groupedSessions.older)}
                    </>
                  )}
                </div>
              </aside>
            )}

            {/* Main Chat Canvas chuẩn Gemini */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0B111E]">
              {/* Khu vực hiển thị hội thoại hoặc Màn hình chào mừng Gemini */}
              <div className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-4 space-y-4">
                {messages.length === 0 ? (
                  /* Màn hình Chào mừng kiểu Gemini khi mở Phiên mới */
                  <div className="h-full min-h-[320px] flex flex-col items-center justify-center max-w-xl mx-auto py-4 text-center">
                    <div className="mb-3">
                      <SchoolifyRobot size="md" emotion={emotion} isFloating />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-[#00B8DD] via-sky-400 to-amber-400 bg-clip-text text-transparent">
                      Xin chào, hôm nay mình cùng học gì nào?
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
                      Tớ có thể giải chi tiết bài tập K-12, gợi mở Socratic từng bước hoặc tạo đề luyện thi thích ứng cho bạn.
                    </p>

                    {/* Lưới 4 Thẻ Gợi ý khởi đầu kiểu Gemini (flex-wrap / grid sạch sẽ) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full mt-5 text-left">
                      {GEMINI_STARTER_CARDS.map((card) => (
                        <button
                          key={card.title}
                          type="button"
                          onClick={() => sendMessage(card.prompt)}
                          className="group p-3 rounded-2xl bg-slate-50/90 hover:bg-[#00B8DD]/10 dark:bg-slate-900/70 dark:hover:bg-[#00B8DD]/15 border border-slate-200/80 dark:border-slate-800 hover:border-[#00B8DD]/40 transition-all cursor-pointer flex items-start gap-2.5"
                        >
                          <span className="text-lg shrink-0 mt-0.5">{card.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#007D99] dark:group-hover:text-[#5CE1FF] transition-colors">
                              {card.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {card.desc}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Danh sách tin nhắn trong phiên đang mở */
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={msg.id ? `${msg.id}-${idx}` : `chat-msg-${idx}`}
                        className={`flex flex-col ${
                          msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <div className="max-w-[85%] sm:max-w-[78%] rounded-2xl rounded-tr-sm px-3.5 py-1.5 bg-[#00B8DD] text-white text-xs sm:text-[13px] font-medium leading-snug break-words shadow-xs">
                            <AgentChatMessageContent content={msg.content} role="user" />
                          </div>
                        ) : (
                          <div className="w-full max-w-[96%] sm:max-w-[92%] space-y-1.5">
                            {/* Dòng tiêu đề nhỏ gọn phía trên câu trả lời AI */}
                            <div className="flex flex-wrap items-center gap-1.5 px-1">
                              <span className="text-[11px] font-bold text-[#007D99] dark:text-[#5CE1FF] flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#00B8DD]" />
                                <span>Schoolify AI</span>
                              </span>
                              <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                            </div>

                            {/* Khung nội dung AI */}
                            <div
                              className={`rounded-2xl rounded-tl-xs px-4 py-3 bg-slate-50/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border text-xs sm:text-[13px] leading-relaxed break-words ${
                                msg.isInterrupted || msg.pointUsage?.isInterrupted
                                  ? 'border-amber-500/60 dark:border-amber-500/50 ring-1 ring-amber-500/20'
                                  : 'border-slate-200/80 dark:border-slate-800/90'
                              }`}
                            >
                              <AgentChatMessageContent content={msg.content} role="assistant" />

                              {/* Khung cảnh báo dừng giữa chừng giống Antigravity khi hết Ngọc đang suy luận */}
                              {(msg.isInterrupted || msg.pointUsage?.isInterrupted) && (
                                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/35 text-amber-900 dark:text-amber-200 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                                    <span className="text-[11px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span>⏸️ Đã dừng suy luận giữa chừng do hết Ngọc Tri Thức (0 💎)</span>
                                    </span>
                                    {msg.pointUsage?.tokensPaidFor ? (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                                        Đã giải {msg.pointUsage.tokensPaidFor}/{msg.pointUsage.tokensUsed} token
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="text-[11px] text-amber-800/90 dark:text-amber-200/85 leading-relaxed">
                                    Ngữ cảnh đang dang dở đã được lưu tự động. Sau khi nhận thêm Ngọc Tri Thức, ở <strong>lần hỏi tiếp theo</strong> AI sẽ tự động nối tiếp phần lời giải còn lại!
                                  </p>
                                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    <button
                                      type="button"
                                      disabled={isSending}
                                      onClick={() => sendMessage('Tiếp tục giải phần đang dang dở')}
                                      className="px-2.5 py-1.5 rounded-lg bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Tiếp tục suy luận ngay</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => router.push('/luyen-thi')}
                                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Compass className="w-3 h-3" />
                                      <span>Luyện đề nhận +5 💎</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => router.push('/bang-gia')}
                                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <CreditCard className="w-3 h-3" />
                                      <span>Nạp thêm Ngọc</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Các nút hành động đính kèm (Tạo đề, Điều hướng...) */}
                              {msg.actions && msg.actions.length > 0 && (
                                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex flex-wrap gap-2">
                                  {msg.actions.map((act, aIdx) => {
                                    const actionKey = `${msg.id}-${aIdx}`;
                                    const isBusy = executingActionIdx === actionKey;

                                    if (act.type === 'CONFIGURE_EXAM_MATRIX') {
                                      return (
                                        <button
                                          key={actionKey}
                                          type="button"
                                          disabled={isBusy}
                                          onClick={() => executeClientAction(act, actionKey)}
                                          className="w-full p-2.5 rounded-xl bg-gradient-to-r from-[#00B8DD]/10 to-emerald-500/10 hover:from-[#00B8DD]/20 hover:to-emerald-500/20 border border-[#00B8DD]/35 text-left transition-all cursor-pointer flex items-center justify-between gap-2"
                                        >
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold text-[#007D99] dark:text-[#5CE1FF] flex items-center gap-1.5">
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

                                    if (act.type === 'NAVIGATE_PAGE' || act.type === 'NAVIGATE') {
                                      const targetUrl = act.payload?.path || act.payload?.url || '/luyen-thi';
                                      return (
                                        <button
                                          key={actionKey}
                                          type="button"
                                          onClick={() => router.push(targetUrl)}
                                          className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#00B8DD] text-white font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                        >
                                          <Compass className="w-3.5 h-3.5 text-[#00B8DD]" />
                                          <span>{act.payload?.label || `Đi tới ${targetUrl}`}</span>
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
                                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
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
                                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                        >
                                          <CreditCard className="w-3.5 h-3.5" />
                                          <span>Chọn Gói {act.payload?.plan || 'PRO'}</span>
                                        </button>
                                      );
                                    }

                                    return (
                                      <button
                                        key={actionKey}
                                        type="button"
                                        onClick={() => executeClientAction(act, actionKey)}
                                        className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                                      >
                                        <Lightbulb className="w-3.5 h-3.5" />
                                        <span>{act.payload?.hintTitle || 'Xem gợi mở Socratic'}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Thanh công cụ tối giản dưới tin nhắn AI */}
                              <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/70 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                                    className="px-2 py-0.5 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Sao chép câu trả lời"
                                  >
                                    {copiedMsgId === msg.id ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-500" />
                                        <span className="text-emerald-500 font-semibold">Đã chép</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3" />
                                        <span>Sao chép</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {typeof msg.pointUsage?.pointsDeducted === 'number' &&
                                  msg.pointUsage.pointsDeducted > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                      <NgocIcon className="w-3 h-3 shrink-0" />
                                      <span>
                                        -{msg.pointUsage.pointsDeducted} 💎
                                        {msg.pointUsage.tokensUsed
                                          ? ` (${msg.pointUsage.tokensUsed} tok)`
                                          : ''}
                                        {typeof msg.pointUsage.remainingDiamonds === 'number'
                                          ? ` • Còn ${msg.pointUsage.remainingDiamonds} 💎`
                                          : ''}
                                      </span>
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Trạng thái AI đang tư duy suy luận dạng các chấm hình học */}
                    {isSending && (
                      <div className="flex items-center gap-2.5 px-1 min-h-[44px] animate-in fade-in duration-150">
                        <div className="shrink-0">
                          <SchoolifyRobot size="sm" emotion="thinking" />
                        </div>
                        <AgentReasoningProcess
                          isLive={true}
                          currentQuery={sendingQuery}
                          questionContext={sendingQuestionContext}
                        />
                      </div>
                    )}

                    {/* Gợi ý câu hỏi tiếp nối ngay dưới tin nhắn cuối (flex-wrap, không chiếm khung nhập) */}
                    {!isSending && suggestions.length > 0 && (
                      <div className="pt-1 flex flex-wrap items-center gap-1.5">
                        {suggestions.slice(0, 3).map((sug, idx) => (
                          <button
                            key={`${sug}-${idx}`}
                            type="button"
                            onClick={() => sendMessage(sug)}
                            className="px-2.5 py-1 rounded-full bg-slate-100/90 dark:bg-slate-900 hover:bg-[#00B8DD]/15 text-slate-600 dark:text-slate-300 hover:text-[#007D99] dark:hover:text-[#5CE1FF] text-[11px] font-medium border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Cảnh báo khi còn <= 1 Ngọc Tri Thức */}
              {remainingDiamondsBalance !== null &&
                remainingDiamondsBalance <= 1 &&
                remainingDiamondsBalance > 0 && (
                  <div className="px-3.5 py-2 bg-amber-500/10 dark:bg-amber-950/40 border-t border-amber-500/30 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-800 dark:text-amber-200 shrink-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <NgocIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <strong>Cảnh báo:</strong> Bạn chỉ còn{' '}
                        <strong>{remainingDiamondsBalance} 💎</strong> (≤ 1 Ngọc). Nếu hết Ngọc khi
                        đang giải, AI sẽ dừng giữa chừng.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push('/luyen-thi')}
                      className="px-2 py-0.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                    >
                      Nhận thêm Ngọc →
                    </button>
                  </div>
                )}

              {/* Khung nhập câu hỏi kiểu Gemini Pill Composer */}
              <div className="p-3 bg-white dark:bg-[#0B111E] border-t border-slate-200/70 dark:border-slate-800/80 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 focus-within:border-[#00B8DD] focus-within:ring-2 focus-within:ring-[#00B8DD]/20 transition-all"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi Schoolify AI bất kỳ điều gì..."
                    className="flex-1 min-w-0 py-1.5 bg-transparent text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="p-2 rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold disabled:opacity-35 transition-all cursor-pointer shrink-0"
                    title="Gửi tin nhắn"
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
