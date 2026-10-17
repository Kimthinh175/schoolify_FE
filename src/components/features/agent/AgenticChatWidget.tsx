'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Compass,
  Sliders,
  Lightbulb,
  FileText,
  CreditCard,
  CheckCircle2,
  XCircle,
  Zap,
  Cpu,
  Minimize2,
  Maximize2,
  Minus,
  BrainCircuit,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface ClientToolAction {
  type:
    | 'CONFIGURE_EXAM_MATRIX'
    | 'NAVIGATE_PAGE'
    | 'SELECT_PRICING_PLAN'
    | 'SOCRATIC_HINT'
    | 'OPEN_DOCX_SCANNER'
    | 'RUN_SEMANTIC_CHECKPOINT'
    | string;
  payload: Record<string, any>;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'SEMANTIC_CACHE' | 'ANTIGRAVITY_AGENT';
  similarity?: number;
  actions?: ClientToolAction[];
}

interface CheckpointResult {
  isCorrect: boolean;
  vectorSimilarity: number;
  matchedSentence: string | null;
  explanation: string;
}

const QUICK_PROMPTS = [
  {
    label: '🎯 Tạo đề Toán 12 khó',
    prompt: 'Tạo đề Toán lớp 12 mức độ khó 10 câu',
  },
  {
    label: '💡 Gợi ý Socratic cực trị',
    prompt: 'Gợi ý bước giải bài toán cực trị hàm số bậc 3',
  },
  {
    label: '📄 Quét đề Word .docx',
    prompt: 'Mở công cụ quét đề thi file word docx sinh câu hỏi',
  },
  {
    label: '🧠 Chấm tự luận ngữ nghĩa',
    prompt: 'Kiểm tra câu trả lời tự luận bằng semantic checkpoint',
  },
  {
    label: '💳 Tư vấn gói PRO',
    prompt: 'Tư vấn gói đăng ký Pro luyện đề không giới hạn',
  },
];

const CHECKPOINT_PRESETS = [
  {
    label: '✅ TH1: Diễn đạt khác nhưng ĐÚNG',
    checkpoint: 'Quang hợp diễn ra tại lục lạp',
    answer:
      'Trong tế bào thực vật, quá trình quang hợp diễn ra chủ yếu tại bào quan lục lạp của lá cây.',
  },
  {
    label: '⚠️ TH2: Bẫy phủ định (Vector cao nhưng SAI)',
    checkpoint: 'Quang hợp diễn ra tại lục lạp',
    answer:
      'Quá trình quang hợp hoàn toàn không diễn ra ở lục lạp mà diễn ra ở ti thể.',
  },
  {
    label: '🚫 TH3: Lạc đề (Vector < 0.55 loại ngay)',
    checkpoint: 'Quang hợp diễn ra tại lục lạp',
    answer: 'Hôm nay trời nắng đẹp em đi học thêm toán hình học không gian.',
  },
];

export function AgenticChatWidget() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'CHAT' | 'CHECKPOINT'>('CHAT');
  const isManagementRoute =
    Boolean(pathname?.startsWith('/admin') ||
    pathname?.startsWith('/school') ||
    pathname?.startsWith('/teacher'));
  const [isLauncherMinimized, setIsLauncherMinimized] = React.useState(false);
  const [isBubbleDismissed, setIsBubbleDismissed] = React.useState(isManagementRoute);

  React.useEffect(() => {
    if (isManagementRoute) {
      setIsBubbleDismissed(true);
    }
  }, [pathname, isManagementRoute]);

  // Chat state
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [executingActionIdx, setExecutingActionIdx] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        'Chào em! Thầy là **Trợ lý Tác nhân AI Schoolify** (Hybrid Vector Semantic Cache + Antigravity IPC).\n\nThầy có thể **tự động cấu hình ma trận đề thi**, **dẫn đường vào phòng thi**, **chữa bài từng bước theo phương pháp Socratic**, hoặc **chấm câu trả lời tự luận bằng đối soát ngữ nghĩa**.',
      timestamp: 'Vừa xong',
      source: 'ANTIGRAVITY_AGENT',
      actions: [
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

  // Semantic Checkpoint state
  const [rubricCheckpoint, setRubricCheckpoint] = React.useState(
    'Quang hợp diễn ra tại lục lạp'
  );
  const [studentAnswer, setStudentAnswer] = React.useState(
    'Trong tế bào thực vật, quá trình quang hợp diễn ra chủ yếu tại bào quan lục lạp của lá cây.'
  );
  const [isGrading, setIsGrading] = React.useState(false);
  const [checkpointResult, setCheckpointResult] = React.useState<CheckpointResult | null>(
    null
  );

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isOpen && activeTab === 'CHAT') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

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
          'Thầy đã ghi nhận yêu cầu của em. Hãy chọn thao tác bên dưới nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        source: payload?.source || 'ANTIGRAVITY_AGENT',
        similarity: payload?.similarity,
        actions: Array.isArray(payload?.actions) ? payload.actions : [],
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `Hiện không kết nối được cổng Agentic Backend (${err?.message || 'Lỗi mạng'}). Em vui lòng thử lại nhé!`,
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
        const targetPath = action.payload?.path || '/student/practice/exam-room';
        toast.info(`Trợ lý AI đang dẫn đường tới: ${targetPath}`);
        router.push(targetPath);
      } else if (action.type === 'SELECT_PRICING_PLAN') {
        const plan = action.payload?.plan || 'PRO';
        toast.success(`Đã chọn gói ${plan}! Đang chuyển tới trang Bảng Giá...`);
        router.push(`/pricing?plan=${plan}`);
      } else if (action.type === 'OPEN_DOCX_SCANNER') {
        toast.success('Đang mở AI Docx Exam Scanner & Generator...');
        router.push('/admin/questions/import');
      } else if (action.type === 'RUN_SEMANTIC_CHECKPOINT') {
        if (action.payload?.rubricCheckpoint) {
          setRubricCheckpoint(action.payload.rubricCheckpoint);
        }
        if (action.payload?.studentAnswer) {
          setStudentAnswer(action.payload.studentAnswer);
        }
        setActiveTab('CHECKPOINT');
        await handleGradeCheckpoint(
          action.payload?.studentAnswer || studentAnswer,
          action.payload?.rubricCheckpoint || rubricCheckpoint
        );
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

  const handleGradeCheckpoint = async (
    overrideAnswer?: string,
    overrideCheckpoint?: string
  ) => {
    const ans = (overrideAnswer ?? studentAnswer).trim();
    const chk = (overrideCheckpoint ?? rubricCheckpoint).trim();
    if (!ans || !chk) return;

    setIsGrading(true);
    try {
      const res = await fetch('/api/v1/agent/semantic-checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: 'q-bio-checkpoint-01',
          studentAnswer: ans,
          rubricCheckpoint: chk,
        }),
      });
      const json = await res.json();
      const resultData = json?.data || json;
      setCheckpointResult(resultData);
    } catch (error: any) {
      toast.error('Lỗi chấm điểm Semantic Checkpoint', {
        description: error?.message,
      });
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* Hiệu ứng chuyển động lơ lửng & vòng năng lượng cho Robot Mascot */}
      <style>{`
        @keyframes robotFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes hologramPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.12); opacity: 0.95; }
        }
      `}</style>

      {/* Nút Floating mở Chatbox: Mascot Robot 3D & Bóng Thoại Chào Mừng */}
      {!isOpen && (
        <div className="relative flex flex-col sm:flex-row items-end sm:items-center gap-2.5 sm:gap-3">
          {/* Bóng thoại chào mừng (Speech Bubble phong cách Trợ lý AI) */}
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
                  Xin chào 👋 Em là <strong className="text-[#007D99] dark:text-[#00B8DD] font-black">Trợ lý ảo AI Schoolify</strong>. Bạn cần giải bài tập, tạo đề thi hay chấm tự luận, cứ hỏi em nhé!
                </p>

                {/* Các nút gợi ý nhanh */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(true);
                      sendMessage("Tạo ma trận đề thi thử");
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
                      setActiveTab('CHECKPOINT');
                    }}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    🎯 Chấm tự luận
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Linh vật Robot 3D nổi lơ lửng */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsBubbleDismissed(false);
            }}
            aria-label="Mở Trợ lý AI Schoolify"
            className="relative flex flex-col items-center group cursor-pointer select-none transition-transform hover:scale-105 active:scale-95 focus:outline-none shrink-0"
          >
            {/* Robot Floating Body */}
            <div className="relative w-15 h-15 sm:w-17 sm:h-17 flex items-center justify-center animate-[robotFloat_3s_ease-in-out_infinite]">
              {/* Lớp hào quang xanh ngọc breathing aura */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 dark:bg-cyan-400/30 blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Avatar Robot 3D */}
              <img
                src="/bot-avatar-128.png"
                alt="Trợ lý AI Schoolify"
                className="w-13 h-13 sm:w-15 sm:h-15 rounded-full object-cover relative z-10 drop-shadow-[0_8px_16px_rgba(16,185,129,0.45)] ring-2.5 ring-emerald-400 dark:ring-[#00B8DD] bg-slate-900"
              />

              {/* Điểm phát xung trực tuyến xanh lá */}
              <span className="absolute top-0 right-0 z-20 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 ring-2 ring-white dark:ring-slate-950" />
              </span>
            </div>

            {/* Vòng năng lượng Hologram dưới chân Robot */}
            <div className="w-12 h-2.5 rounded-full border-2 border-dashed border-emerald-400/80 dark:border-cyan-400/80 bg-emerald-400/15 blur-[0.5px] -mt-1 animate-[hologramPulse_2.5s_ease-in-out_infinite]" />
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
              <div className="relative w-10 h-10 rounded-full shrink-0 ring-2 ring-emerald-400 shadow-md shadow-emerald-500/20">
                <img
                  src="/bot-avatar-128.png"
                  alt="Trợ Lý AI Schoolify"
                  className="w-10 h-10 rounded-full object-cover bg-slate-900"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
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
                  Trả lời 24/7 • Phương pháp Socratic &amp; Khảo thí K-12
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

          {/* Thanh chuyển Tab (Luật thép Mobile: flex-wrap, không cuộn ngang) */}
          <div className="p-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('CHAT')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'CHAT'
                  ? 'bg-[#00B8DD] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Gia Sư Tác Nhân (Tool Actions)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('CHECKPOINT')}
              className={`flex-1 min-w-[140px] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'CHECKPOINT'
                  ? 'bg-[#00B8DD] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
              <span>Chấm Tự Luận (Checkpoint)</span>
            </button>
          </div>

          {activeTab === 'CHAT' ? (
            <>
              {/* Danh sách tin nhắn */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Badge Nguồn phản hồi (Semantic Cache HIT vs Agentic IPC) */}
                    {msg.role === 'assistant' && msg.source && (
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        {msg.source === 'SEMANTIC_CACHE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>
                              Semantic Cache HIT (
                              {((msg.similarity || 0.99) * 100).toFixed(1)}%)
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] border border-[#00B8DD]/30">
                            <Cpu className="w-3 h-3" />
                            <span>Antigravity IPC Bridge</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>
                    )}

                    {/* Bong bóng nội dung */}
                    <div className={`flex items-start gap-2 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 ring-1.5 ring-emerald-400 shadow-xs mt-0.5 bg-slate-900">
                          <img src="/bot-avatar-128.png" alt="Bot Schoolify" className="w-full h-full object-cover" />
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
                            ⚡ Tác vụ thực thi tự động trên Client:
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
                                          <span>Tạo & Thi</span>
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
                                    className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-[#00B8DD] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <Compass className="w-3.5 h-3.5 text-[#00B8DD]" />
                                    <span>
                                      {act.payload?.label ||
                                        `Đi tới ${act.payload?.path}`}
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
                                      Chọn Gói {act.payload?.plan || 'PRO'} & Thanh Toán VietQR
                                    </span>
                                  </button>
                                );
                              }

                              if (act.type === 'RUN_SEMANTIC_CHECKPOINT') {
                                return (
                                  <button
                                    key={actionKey}
                                    type="button"
                                    onClick={() => executeClientAction(act, actionKey)}
                                    className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                  >
                                    <BrainCircuit className="w-3.5 h-3.5" />
                                    <span>Chạy Kiểm Thử Semantic Checkpoint Ngay</span>
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
                                  <span>
                                    {act.payload?.hintTitle || 'Xem gợi mở Socratic'}
                                  </span>
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
                  placeholder="Nhập yêu cầu (VD: Tạo đề Toán 12 khó, Gợi ý giải...)"
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#00B8DD]"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isSending}
                  className="p-2.5 rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] text-white disabled:opacity-40 transition-all cursor-pointer shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          ) : (
            /* TAB 2: SEMANTIC CHECKPOINT GRADING ENGINE */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              <div className="p-3 rounded-2xl bg-[#00B8DD]/10 border border-[#00B8DD]/30 space-y-1">
                <p className="text-xs font-black text-[#007D99] dark:text-[#00B8DD] flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 shrink-0" />
                  <span>Hybrid Semantic Checkpoint (Chấm Tự Luận & Điền Từ)</span>
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. <strong>Vector Filter (all-MiniLM-L6-v2)</strong>: Lọc nhanh các câu lạc đề có độ tương đồng ngữ cảnh &lt; 0.55.<br />
                  2. <strong>Antigravity Logic Engine</strong>: Phát hiện bẫy phủ định (<em>&quot;không diễn ra&quot;, &quot;trái ngược&quot;</em>) và đối soát từ khóa cốt lõi.
                </p>
              </div>

              {/* 3 kịch bản test mẫu 1-Click */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  Chọn nhanh kịch bản kiểm thử thực tế:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {CHECKPOINT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setRubricCheckpoint(preset.checkpoint);
                        setStudentAnswer(preset.answer);
                        handleGradeCheckpoint(preset.answer, preset.checkpoint);
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#00B8DD] text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tiêu chí đáp án chuẩn (Rubric Checkpoint):
                  </label>
                  <input
                    type="text"
                    value={rubricCheckpoint}
                    onChange={(e) => setRubricCheckpoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Bài làm tự luận của Học sinh:
                  </label>
                  <textarea
                    rows={3}
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="button"
                  disabled={isGrading}
                  onClick={() => handleGradeCheckpoint()}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#00B8DD] hover:bg-[#009bbd] text-white font-black text-xs shadow-md shadow-[#00B8DD]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isGrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BrainCircuit className="w-4 h-4" />
                  )}
                  <span>Chấm Điểm Đối Soát Ngữ Nghĩa Ngay</span>
                </button>
              </div>

              {/* Kết quả chấm Semantic Checkpoint */}
              {checkpointResult && (
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    checkpointResult.isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-black">
                      {checkpointResult.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>ĐẠT TIÊU CHÍ (isCorrect: true)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>KHÔNG ĐẠT (isCorrect: false)</span>
                        </>
                      )}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-slate-900/70 text-[10px] font-mono font-bold">
                      Cosine Vector: {(checkpointResult.vectorSimilarity * 100).toFixed(1)}%
                    </span>
                  </div>

                  {checkpointResult.matchedSentence && (
                    <p className="text-[11px] opacity-90 break-words">
                      <strong>Câu khớp nhất:</strong> &ldquo;{checkpointResult.matchedSentence}&rdquo;
                    </p>
                  )}

                  <p className="text-xs font-semibold leading-relaxed break-words">
                    {checkpointResult.explanation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
