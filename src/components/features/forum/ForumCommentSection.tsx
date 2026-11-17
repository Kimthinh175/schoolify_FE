'use client';

import * as React from 'react';
import {
  ThumbsUp,
  MessageSquare,
  CornerDownRight,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Upload,
  Send,
  Sparkles,
  Eye,
  Edit3,
  Award,
  ShieldCheck,
  Clock,
  HelpCircle,
  Pin,
  Lock,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MathRenderer } from '@/components/ui/math-renderer';
import { cn } from '@/lib/utils';

export type ForumReactionType = 'LIKE' | 'HELPFUL' | 'LOVE' | 'HAHA';

export interface ForumCommentAuthor {
  id?: string;
  name: string;
  avatar?: string;
  role: string;
  grade?: string;
}

export interface ForumReplyItem {
  id: string;
  postId: string;
  parentId: string;
  depth: 2;
  replyToUserName?: string;
  author: ForumCommentAuthor;
  content: string;
  attachments?: string[] | null;
  timeAgo: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface ForumCommentItem {
  id: string;
  postId: string;
  parentId: null | string;
  depth: 1 | 2;
  author: ForumCommentAuthor;
  content: string;
  attachments?: string[] | null;
  timeAgo: string;
  likesCount: number;
  isLiked?: boolean;
  isAccepted?: boolean;
  replies?: ForumReplyItem[];
}

export interface ForumCommentSectionProps {
  postId: string;
  postSlug?: string;
  postTitle?: string;
  className?: string;
  initialComments?: ForumCommentItem[];
  isLocked?: boolean;
}

// Các mẫu công thức toán học nhanh để học sinh chèn vào lời giải KaTeX
const QUICK_MATH_SNIPPETS = [
  { label: 'x²', insert: '$x^2$', desc: 'Bình phương' },
  { label: 'a/b', insert: '$\\frac{a}{b}$', desc: 'Phân số' },
  { label: '√x', insert: '$\\sqrt{x}$', desc: 'Căn bậc hai' },
  { label: '∫ f(x)', insert: '$\\int_{a}^{b} f(x) dx$', desc: 'Tích phân' },
  { label: 'lim', insert: '$\\lim_{x \\to +\\infty}$', desc: 'Giới hạn' },
  { label: 'f\'(x)', insert: '$f\'(x) \\ge 0$', desc: 'Đạo hàm' },
  { label: 'v⃗', insert: '$\\vec{v}$', desc: 'Vectơ' },
  { label: 'Δ', insert: '$\\Delta = b^2 - 4ac$', desc: 'Delta' },
  { label: 'Hệ pt', insert: '$$\\begin{cases} x + y = 1 \\\\ x - y = 3 \\end{cases}$$', desc: 'Hệ phương trình' },
];

const DEFAULT_SAMPLE_COMMENTS: ForumCommentItem[] = [
  {
    id: 'cmt-accepted-01',
    postId: 'sample-post',
    parentId: null,
    depth: 1,
    author: {
      id: 'teacher-hung',
      name: 'ThS. Nguyễn Văn Hùng',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&auto=format&fit=crop&q=80',
      role: 'Giáo viên Toán',
      grade: 'Tổ Toán THPT Chuyên',
    },
    content:
      '**Lời giải chi tiết:**\n\nTa có đạo hàm hàm số bậc ba:\n$$y\' = 3x^2 - 6mx + 3(2m - 1) = 3(x - 1)(x - 2m + 1)$$\n\nĐể hàm số đồng biến trên khoảng $(0; +\\infty)$ thì $y\' \\ge 0, \\forall x \\in (0; +\\infty)$, tương đương:\n$$2m(x - 1) \\le x^2 - 1 = (x - 1)(x + 1), \\quad \\forall x > 0$$\n\nVì biểu thức $(x - 1)$ đổi dấu khi đi qua điểm $x = 1 \\in (0; +\\infty)$, nên để bất phương trình nghiệm đúng với mọi $x > 0$ thì hai nghiệm của $y\' = 0$ phải trùng nhau tại $x = 1$ (nghiệm kép):\n$$2m - 1 = 1 \\iff m = 1$$\n\nKhi $m = 1$, ta có $y\' = 3(x - 1)^2 \\ge 0, \\forall x \\in \\mathbb{R}$ (thỏa mãn yêu cầu bài toán). Vậy **$m = 1$** là giá trị duy nhất cần tìm.',
    attachments: null,
    timeAgo: '45 phút trước',
    likesCount: 38,
    isLiked: true,
    isAccepted: true,
    replies: [
      {
        id: 'reply-01-01',
        postId: 'sample-post',
        parentId: 'cmt-accepted-01',
        depth: 2,
        replyToUserName: 'ThS. Nguyễn Văn Hùng',
        author: {
          id: 'student-minh',
          name: 'Nguyễn Minh Anh',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          role: 'Học sinh',
          grade: 'Lớp 12A1 KHTN',
        },
        content:
          'Em cảm ơn thầy nhiều ạ! Cách phân tích thành nhân tử $(x - 1)(x - 2m + 1)$ rồi biện luận nghiệm kép ở điểm đổi dấu $x = 1$ nhanh và dễ hiểu hơn cách em lập bảng biến thiên rất nhiều ạ.',
        timeAgo: '30 phút trước',
        likesCount: 12,
        isLiked: false,
      },
      {
        id: 'reply-01-02',
        postId: 'sample-post',
        parentId: 'cmt-accepted-01',
        depth: 2,
        replyToUserName: 'Nguyễn Minh Anh',
        author: {
          id: 'student-bao',
          name: 'Trần Gia Bảo',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
          role: 'Học sinh',
          grade: 'Lớp 12 Lý',
        },
        content:
          'Chuẩn luôn, bài này nếu cô lập $m$ chia trường hợp $x \\in (0; 1)$ và $x \\in (1; +\\infty)$ cũng ra $m \\ge 1$ và $m \\le 1 \\implies m = 1$ nhưng dài dòng hơn.',
        timeAgo: '20 phút trước',
        likesCount: 5,
        isLiked: false,
      },
    ],
  },
  {
    id: 'cmt-normal-02',
    postId: 'sample-post',
    parentId: null,
    depth: 1,
    author: {
      id: 'teacher-nam',
      name: 'Thầy Lê Hoàng Nam',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      role: 'Giáo viên',
      grade: 'Tổ Toán',
    },
    content:
      'Ngoài ra các em có thể dùng phương pháp Tam thức bậc hai $g(x) = x^2 - 2mx + 2m - 1$:\n- TH1: $\\Delta\' = m^2 - 2m + 1 = (m - 1)^2 \\le 0 \\iff m = 1$.\n- TH2: $\\Delta\' > 0$, hai nghiệm $x_1 < x_2 \\le 0$ (vô lý vì $x_1 = 1 > 0$).\nDo đó chỉ có $m = 1$.',
    attachments: null,
    timeAgo: '1 giờ trước',
    likesCount: 16,
    isLiked: false,
    isAccepted: false,
    replies: [],
  },
];

export function ForumCommentSection({
  postId,
  postSlug,
  postTitle,
  className,
  initialComments,
  isLocked = false,
}: ForumCommentSectionProps) {
  const [comments, setComments] = React.useState<ForumCommentItem[]>(
    initialComments && initialComments.length > 0
      ? initialComments
      : DEFAULT_SAMPLE_COMMENTS
  );
  const [isLockedState, setIsLockedState] = React.useState(isLocked);
  const [apiSuccessMessage, setApiSuccessMessage] = React.useState<string | null>(null);
  const [content, setContent] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'write' | 'preview'>('write');
  const [attachedImages, setAttachedImages] = React.useState<string[]>([]);
  const [replyingToId, setReplyingToId] = React.useState<string | null>(null);
  const [replyContent, setReplyContent] = React.useState('');
  const [replyImages, setReplyImages] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [replyActiveTab, setReplyActiveTab] = React.useState<'write' | 'preview'>('write');

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const replyFileInputRef = React.useRef<HTMLInputElement | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useEffect(() => {
    setIsLockedState(isLocked);
  }, [isLocked]);

  // Thử tải dữ liệu bình luận từ API Backend (Stack ngày 14/11)
  React.useEffect(() => {
    let isMounted = true;
    async function fetchComments() {
      try {
        const idOrSlug = postSlug || postId;
        const res = await fetch(
          `http://localhost:3005/api/v1/forum/posts/${idOrSlug}/comments?sort=best`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data?.post?.is_locked !== undefined) {
          setIsLockedState(Boolean(json.data.post.is_locked));
        }
        if (json?.data?.items && Array.isArray(json.data.items) && json.data.items.length > 0) {
          if (!isMounted) return;
          const mapped: ForumCommentItem[] = json.data.items.map((item: any) => ({
            id: item.id,
            postId: item.post_id || postId,
            parentId: item.parent_id || null,
            depth: item.depth || 1,
            author: {
              name: item.author?.fullname || 'Thành viên Schoolify',
              avatar: item.author?.avatar_url || undefined,
              role: item.author?.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh',
              grade: item.author?.role === 'TEACHER' ? 'Tổ Chuyên Môn' : 'Lớp 12',
            },
            content: item.content || '',
            attachments: Array.isArray(item.attachments) ? item.attachments : null,
            timeAgo: 'Gần đây',
            likesCount: item.likes_count || item.reaction_summary?.total || 0,
            isLiked: Boolean(item.reaction_summary?.user_reaction),
            isAccepted: Boolean(item.is_accepted || item.is_pinned_best_answer),
            replies: Array.isArray(item.replies)
              ? item.replies.map((r: any) => ({
                  id: r.id,
                  postId: r.post_id || postId,
                  parentId: r.parent_id,
                  depth: 2,
                  replyToUserName: r.reply_to_user?.fullname || undefined,
                  author: {
                    name: r.author?.fullname || 'Học sinh',
                    avatar: r.author?.avatar_url || undefined,
                    role: r.author?.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh',
                    grade: 'Lớp 12',
                  },
                  content: r.content || '',
                  attachments: Array.isArray(r.attachments) ? r.attachments : null,
                  timeAgo: 'Gần đây',
                  likesCount: r.likes_count || 0,
                  isLiked: false,
                }))
              : [],
          }));
          setComments(mapped);
        }
      } catch {
        // Fallback sang danh sách mẫu
      }
    }

    void fetchComments();
    return () => {
      isMounted = false;
    };
  }, [postId, postSlug]);

  // Xử lý chèn cú pháp toán nhanh tại vị trí con trỏ
  const handleInsertSnippet = (snippet: string, isReply = false) => {
    if (isReply) {
      setReplyContent((prev) => `${prev} ${snippet} `);
    } else {
      setContent((prev) => `${prev} ${snippet} `);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Xử lý chọn ảnh từ máy (chụp vở bài giải)
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isReply = false
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          if (isReply) {
            setReplyImages((prev) => [...prev, result]);
          } else {
            setAttachedImages((prev) => [...prev, result]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemoveImage = (index: number, isReply = false) => {
    if (isReply) {
      setReplyImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setAttachedImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Toggle Hữu ích (Like/ThumbsUp) cho lời giải cấp 1
  const handleToggleLike = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextIsLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextIsLiked,
            likesCount: nextIsLiked ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
          };
        }
        return c;
      })
    );
  };

  // Toggle Hữu ích cho phản hồi cấp 2
  const handleToggleReplyLike = (rootCommentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === rootCommentId && c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) => {
              if (r.id === replyId) {
                const nextIsLiked = !r.isLiked;
                return {
                  ...r,
                  isLiked: nextIsLiked,
                  likesCount: nextIsLiked ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
                };
              }
              return r;
            }),
          };
        }
        return c;
      })
    );
  };

  // Xóa bình luận / phản hồi an toàn (Stack #16)
  const handleDeleteComment = async (commentId: string, parentId?: string | null) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận / lời giải này không?')) return;
    try {
      await fetch(`http://localhost:3005/api/v1/forum/comments/${commentId}`, {
        method: 'DELETE',
      });
    } catch {
      // offline fallback
    }

    if (parentId) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId && c.replies) {
            return {
              ...c,
              replies: c.replies.filter((r) => r.id !== commentId),
            };
          }
          return c;
        })
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  // Gửi lời giải mới (Cấp 1) - Stack #16: Gửi API kèm cập nhật comments_count & bắn Notification
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && attachedImages.length === 0) return;
    if (isLockedState) {
      alert('Bài viết này đã bị Quản trị viên khóa bình luận (is_locked = true).');
      return;
    }

    setIsSubmitting(true);
    let createdCommentId = `user-cmt-${Date.now()}`;

    try {
      const idOrSlug = postSlug || postId;
      const res = await fetch(
        `http://localhost:3005/api/v1/forum/posts/${idOrSlug}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: content.trim(),
            attachments: attachedImages.length > 0 ? attachedImages : undefined,
          }),
        }
      );

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 403) {
          alert(
            json?.message ||
              'Bài viết này đã bị Admin khóa bình luận (is_locked = true).'
          );
          setIsLockedState(true);
          setIsSubmitting(false);
          return;
        }
      } else if (json?.data?.comment?.id) {
        createdCommentId = json.data.comment.id;
        setApiSuccessMessage(
          'Đã thêm lời giải thành công & tự động cập nhật số lượng thảo luận!'
        );
        setTimeout(() => setApiSuccessMessage(null), 4000);
      }
    } catch {
      // Offline fallback
    }

    const newComment: ForumCommentItem = {
      id: createdCommentId,
      postId,
      parentId: null,
      depth: 1,
      author: {
        id: 'seed-student-01',
        name: 'Bạn (Học Sinh)',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        role: 'Học sinh',
        grade: 'Lớp 12',
      },
      content: content.trim(),
      attachments: attachedImages.length > 0 ? [...attachedImages] : null,
      timeAgo: 'Vừa xong',
      likesCount: 1,
      isLiked: true,
      isAccepted: false,
      replies: [],
    };

    setComments((prev) => [newComment, ...prev]);
    setContent('');
    setAttachedImages([]);
    setActiveTab('write');
    setIsSubmitting(false);
  };

  // Gửi phản hồi lồng cấp 2 - Stack #16: Gửi API kèm cập nhật replies_count & bắn Notification
  const handleSubmitReply = async (rootCommentId: string, replyToName: string) => {
    if (!replyContent.trim() && replyImages.length === 0) return;
    if (isLockedState) {
      alert('Bài viết này đã bị Quản trị viên khóa bình luận (is_locked = true).');
      return;
    }

    let createdReplyId = `reply-${Date.now()}`;

    try {
      const idOrSlug = postSlug || postId;
      const res = await fetch(
        `http://localhost:3005/api/v1/forum/posts/${idOrSlug}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: replyContent.trim(),
            parentId: rootCommentId,
            attachments: replyImages.length > 0 ? replyImages : undefined,
          }),
        }
      );

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 403) {
          alert(
            json?.message ||
              'Bài viết này đã bị Admin khóa bình luận (is_locked = true).'
          );
          setIsLockedState(true);
          return;
        }
      } else if (json?.data?.comment?.id) {
        createdReplyId = json.data.comment.id;
        setApiSuccessMessage(
          'Đã gửi phản hồi cấp 2 & bắn Notification tới người nhận!'
        );
        setTimeout(() => setApiSuccessMessage(null), 4000);
      }
    } catch {
      // Offline fallback
    }

    const newReply: ForumReplyItem = {
      id: createdReplyId,
      postId,
      parentId: rootCommentId,
      depth: 2,
      replyToUserName: replyToName,
      author: {
        id: 'seed-student-01',
        name: 'Bạn (Học Sinh)',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
        role: 'Học sinh',
        grade: 'Lớp 12',
      },
      content: replyContent.trim(),
      attachments: replyImages.length > 0 ? [...replyImages] : null,
      timeAgo: 'Vừa xong',
      likesCount: 0,
      isLiked: false,
    };

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === rootCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          };
        }
        return c;
      })
    );

    setReplyingToId(null);
    setReplyContent('');
    setReplyImages([]);
    setReplyActiveTab('write');
  };

  // Sắp xếp: Luôn đưa Lời giải được công nhận (isAccepted = true) lên trên cùng
  const sortedComments = React.useMemo(() => {
    return [...comments].sort((a, b) => {
      if (a.isAccepted !== b.isAccepted) {
        return a.isAccepted ? -1 : 1;
      }
      return 0;
    });
  }, [comments]);

  const acceptedComment = sortedComments.find((c) => c.isAccepted);
  const totalCommentsCount = comments.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0),
    0
  );

  return (
    <div className={cn('space-y-8', className)}>
      {/* ── TIÊU ĐỀ KHU VỰC THẢO LUẬN ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/10 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Lời Giải &amp; Thảo Luận</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {totalCommentsCount}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Cộng đồng K-12 hỗ trợ giải bài tập chi tiết bằng công thức Toán KaTeX
            </p>
          </div>
        </div>

        {acceptedComment && (
          <Badge
            variant="success"
            className="self-start sm:self-auto bg-emerald-50 dark:bg-emerald-950/60 text-[#10B981] border-[#10B981]/40 font-bold px-3 py-1 text-xs"
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />}
          >
            Đã có lời giải chuẩn xác
          </Badge>
        )}
      </div>

      {/* Thông báo thao tác thành công (Stack #16) */}
      {apiSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{apiSuccessMessage}</span>
        </div>
      )}

      {/* ── STACK #16 & #12: XỬ LÝ KHÓA BÌNH LUẬN AN TOÀN HOẶC KHUNG VIẾT LỜI GIẢI ── */}
      {isLockedState ? (
        <Card className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/30 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Bài thảo luận đã bị Admin khóa bình luận (is_locked = true)
              </h4>
              <Badge variant="outline" className="border-amber-400 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                Đã khóa an toàn
              </Badge>
            </div>
            <p className="text-xs text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
              Quản trị viên đã đóng bài đăng này. Mọi thao tác gửi lời giải mới hoặc trả lời bình luận tạm thời bị chặn để đảm bảo an toàn nội dung.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-4 sm:p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#007D99] dark:text-[#00B8DD]" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Gửi Lời Giải / Bình Luận Của Bạn
            </h4>
          </div>

          {/* Tab Soạn thảo / Xem trước KaTeX */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1',
                activeTab === 'write'
                  ? 'bg-white dark:bg-slate-700 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Edit3 className="w-3 h-3" /> Soạn thảo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1',
                activeTab === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-[#007D99] dark:text-[#00B8DD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Eye className="w-3 h-3" /> Xem trước KaTeX
            </button>
          </div>
        </div>

        {/* Thanh phím tắt chèn nhanh công thức Toán KaTeX */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Chèn nhanh:
          </span>
          {QUICK_MATH_SNIPPETS.map((snip, i) => (
            <button
              key={i}
              type="button"
              title={snip.desc}
              onClick={() => handleInsertSnippet(snip.insert)}
              className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-[#00B8DD]/15 hover:text-[#007D99] dark:hover:text-[#00B8DD] border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
            >
              {snip.label}
            </button>
          ))}
        </div>

        {/* Khung nhập nội dung hoặc Xem trước KaTeX */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          {activeTab === 'write' ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập lời giải chi tiết của bạn tại đây... Dùng $...$ cho công thức toán inline hoặc $$...$$ cho khối công thức riêng..."
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B8DD] transition-all font-sans leading-relaxed"
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 min-h-[100px] text-xs sm:text-sm leading-relaxed">
              {content.trim() ? (
                <MathRenderer text={content} />
              ) : (
                <span className="text-slate-400 italic">
                  Chưa có nội dung. Chuyển sang tab &quot;Soạn thảo&quot; để gõ lời giải và công thức KaTeX...
                </span>
              )}
            </div>
          )}

          {/* Khu vực đính kèm ảnh chụp bài giải / vở ghi */}
          {attachedImages.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {attachedImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Ảnh bài giải ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow-sm cursor-pointer"
                    title="Xóa ảnh này"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer nút hành động: Tải ảnh & Gửi lời giải */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<ImageIcon className="w-3.5 h-3.5 text-[#007D99] dark:text-[#00B8DD]" />}
                className="rounded-xl text-xs font-semibold border-slate-200 dark:border-slate-700 hover:border-[#00B8DD]"
              >
                Đính kèm ảnh bài giải ({attachedImages.length})
              </Button>
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-xl text-xs px-4 shadow-md shadow-[#00B8DD]/20"
            >
              Đăng Lời Giải
            </Button>
          </div>
        </form>
      </Card>
      )}

      {/* ── STACK #11: DANH SÁCH LỜI GIẢI PHÂN CẤP 2 CẤP & KHUNG NỔI BẬT LỜI GIẢI ĐƯỢC CÔNG NHẬN (#10B981) ── */}
      <div className="space-y-5">
        {sortedComments.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <HelpCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">
              Chưa có lời giải nào. Hãy là người đầu tiên chia sẻ đáp án chuẩn cho bài tập này!
            </p>
          </div>
        ) : (
          sortedComments.map((rootCmt) => {
            const isAccepted = Boolean(rootCmt.isAccepted);

            return (
              <div key={rootCmt.id} className="space-y-3">
                {/* ── THẺ LỜI GIẢI CẤP 1 (GỐC) ── */}
                <Card
                  className={cn(
                    'p-5 sm:p-6 rounded-2xl transition-all relative overflow-hidden',
                    // STACK #11: Khung nổi bật Lời giải được công nhận có viền xanh ngọc lục bảo #10B981
                    isAccepted
                      ? 'border-2 border-[#10B981] bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-emerald-950/20 shadow-lg shadow-emerald-500/10'
                      : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  )}
                >
                  {/* STACK #11: Huy hiệu xác thực Lời giải được công nhận */}
                  {isAccepted && (
                    <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#10B981] text-white shadow-md shadow-emerald-600/20">
                      <ShieldCheck className="w-4 h-4" />
                      <span>LỜI GIẢI ĐÃ ĐƯỢC CÔNG NHẬN (BEST ANSWER)</span>
                    </div>
                  )}

                  {/* Header tác giả */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={rootCmt.author.avatar}
                        alt={rootCmt.author.name}
                        size="md"
                        className={cn(isAccepted && 'ring-2 ring-[#10B981]')}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            {rootCmt.author.name}
                          </h4>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded-full',
                              rootCmt.author.role.includes('Giáo viên')
                                ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            )}
                          >
                            {rootCmt.author.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {rootCmt.timeAgo}
                        </span>
                      </div>
                    </div>

                    {isAccepted && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#10B981]">
                        <Award className="w-4 h-4 text-[#10B981]" /> Huy hiệu kiểm định
                      </span>
                    )}
                  </div>

                  {/* Nội dung lời giải (hỗ trợ KaTeX bằng MathRenderer) */}
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-2">
                    <MathRenderer text={rootCmt.content} />
                  </div>

                  {/* Ảnh đính kèm (nếu có) */}
                  {rootCmt.attachments && rootCmt.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-3">
                      {rootCmt.attachments.map((img, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={img}
                          alt="Ảnh bài giải đính kèm"
                          className="max-h-56 rounded-xl border border-slate-200 dark:border-slate-700 object-contain shadow-xs"
                        />
                      ))}
                    </div>
                  )}

                  {/* Footer tương tác: Nút Hữu ích (Like) & Nút Trả lời */}
                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
                    <div className="flex items-center gap-2">
                      {/* STACK #11: Nút Hữu ích (Like/ThumbsUp) với bộ đếm */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(rootCmt.id)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border',
                          rootCmt.isLiked
                            ? isAccepted
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-[#00B8DD] text-white border-[#00B8DD] shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-[#00B8DD]/15 hover:text-[#007D99] hover:border-[#00B8DD]/30 dark:hover:text-[#00B8DD]'
                        )}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Hữu ích ({rootCmt.likesCount})</span>
                      </button>

                      {/* Nút phản hồi mở form Cấp 2 (chỉ hiện khi chưa khóa) */}
                      {!isLockedState && (
                        <button
                          type="button"
                          onClick={() =>
                            setReplyingToId(
                              replyingToId === rootCmt.id ? null : rootCmt.id
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>Trả lời ({rootCmt.replies?.length || 0})</span>
                        </button>
                      )}

                      {/* Nút Xóa bình luận cấp 1 (Stack #16) */}
                      {(rootCmt.author.id === 'seed-student-01' ||
                        rootCmt.author.id === 'me' ||
                        rootCmt.id.startsWith('user-cmt')) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(rootCmt.id)}
                          title="Xóa bình luận này"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Xóa</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400">
                      Cấp 1 • Lời giải chính
                    </span>
                  </div>
                </Card>

                {/* ── FORM TRẢ LỜI LỒNG CẤP 2 (KHI BẤM NÚT TRẢ LỜI) ── */}
                {replyingToId === rootCmt.id && (
                  <Card className="ml-6 sm:ml-12 p-4 rounded-xl border border-[#00B8DD]/40 bg-slate-50/80 dark:bg-slate-850/80 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-[#007D99] dark:text-[#00B8DD]" />
                        Trả lời thảo luận cho {rootCmt.author.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setReplyingToId(null)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Phím tắt công thức cho phản hồi cấp 2 */}
                    <div className="flex flex-wrap items-center gap-1">
                      {QUICK_MATH_SNIPPETS.slice(0, 6).map((snip, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleInsertSnippet(snip.insert, true)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {snip.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      rows={2}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`@${rootCmt.author.name} Nhập phản hồi hoặc thắc mắc thêm về lời giải này...`}
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                    />

                    {replyImages.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {replyImages.map((img, i) => (
                          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img} alt="Ảnh phản hồi" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i, true)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <input
                        ref={replyFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, true)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => replyFileInputRef.current?.click()}
                        leftIcon={<ImageIcon className="w-3.5 h-3.5 text-slate-500" />}
                        className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white"
                      >
                        Đính kèm ảnh
                      </Button>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setReplyingToId(null)}
                          className="rounded-lg text-xs"
                        >
                          Hủy
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleSubmitReply(rootCmt.id, rootCmt.author.name)}
                          className="bg-[#00B8DD] hover:bg-[#009bbd] text-white font-bold rounded-lg text-xs px-3"
                        >
                          Gửi phản hồi
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* ── STACK #11: DANH SÁCH BÌNH LUẬN PHẢN HỒI LỒNG CẤP 2 (NESTED REPLIES) ── */}
                {rootCmt.replies && rootCmt.replies.length > 0 && (
                  <div className="ml-6 sm:ml-12 pl-4 border-l-2 border-[#00B8DD]/30 dark:border-[#00B8DD]/20 space-y-3 pt-1">
                    {rootCmt.replies.map((reply) => (
                      <Card
                        key={reply.id}
                        className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={reply.author.avatar}
                              alt={reply.author.name}
                              size="sm"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                  {reply.author.name}
                                </h5>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                                  {reply.author.role}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reply.timeAgo}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-400 font-medium">
                            Cấp 2 • Thảo luận
                          </span>
                        </div>

                        {/* Nội dung phản hồi có @mention và MathRenderer */}
                        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans pl-1">
                          {reply.replyToUserName && (
                            <span className="font-bold text-[#007D99] dark:text-[#00B8DD] mr-1.5 inline-flex items-center gap-0.5">
                              @{reply.replyToUserName}:
                            </span>
                          )}
                          <MathRenderer text={reply.content} inline />
                        </div>

                        {/* Ảnh đính kèm cấp 2 */}
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1 pl-1">
                            {reply.attachments.map((img, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={i}
                                src={img}
                                alt="Ảnh đính kèm thảo luận"
                                className="max-h-40 rounded-lg border border-slate-200 dark:border-slate-700 object-contain"
                              />
                            ))}
                          </div>
                        )}

                        {/* Nút Hữu ích cấp 2 */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                          <button
                            type="button"
                            onClick={() => handleToggleReplyLike(rootCmt.id, reply.id)}
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer',
                              reply.isLiked
                                ? 'bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] font-bold'
                                : 'text-slate-500 hover:bg-[#00B8DD]/15 hover:text-[#007D99] dark:hover:text-[#00B8DD]'
                            )}
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Hữu ích ({reply.likesCount})</span>
                          </button>

                          <div className="flex items-center gap-2.5">
                            {(reply.author.id === 'seed-student-01' ||
                              reply.author.id === 'me' ||
                              reply.id.startsWith('reply-')) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(reply.id, rootCmt.id)}
                                title="Xóa phản hồi này"
                                className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Xóa</span>
                              </button>
                            )}

                            {!isLockedState && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingToId(rootCmt.id);
                                  setReplyContent(`@${reply.author.name} `);
                                }}
                                className="text-[11px] text-[#007D99] dark:text-[#00B8DD] hover:underline font-semibold cursor-pointer"
                              >
                                Phản hồi lại
                              </button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

