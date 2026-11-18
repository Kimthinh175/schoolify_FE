import { ForumCommentItem } from '@/components/features/forum/ForumCommentSection';
import { ALL_FORUM_SEED_POSTS } from '@/data/forum-seed-posts';

export type ForumTabStatus = 'ALL' | 'HOT' | 'UNSOLVED' | 'SOLVED' | 'SAVED';

export interface ForumAuthor {
  id?: string;
  name: string;
  avatar: string;
  role: string;
  grade: string;
}

export interface ForumPost {
  id: string;
  slug?: string;
  title: string;
  content: string;
  contentPlain?: string;
  hasMath?: boolean;
  attachments?: string[];
  author: ForumAuthor;
  subject: string;
  grade: number;
  chapterId?: number;
  chapterName?: string;
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
  isSolved?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  timeAgo: string;
  createdAt?: string;
  tags: string[];
  initialComments?: ForumCommentItem[];
}

export interface ForumQueryParams {
  subject?: string;
  grade?: number | 'ALL';
  status?: ForumTabStatus;
  search?: string;
  tag?: string;
  page?: number;
  limit?: number;
  bookmarkedIds?: string[];
}

export interface ForumPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ForumPostsListResponse {
  items: ForumPost[];
  pagination: ForumPaginationMeta;
}

export interface CreateForumPostPayload {
  title: string;
  content: string;
  subject: string;
  grade: number;
  chapter_name?: string;
  tags?: string[];
  attachments?: string[];
}

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80';

function getAuthHeaders(includeJsonContentType = false): Record<string, string> {
  const headers: Record<string, string> = includeJsonContentType
    ? { 'Content-Type': 'application/json' }
    : {};
  if (typeof window === 'undefined') return headers;
  try {
    const raw = window.localStorage.getItem('schoolify-auth-storage');
    if (!raw) return headers;
    const parsed = JSON.parse(raw) as {
      state?: { token?: string; user?: { id?: string } };
    };
    const token = parsed?.state?.token;
    const userId = parsed?.state?.user?.id;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
      headers['x-user-id'] = String(userId);
    }
  } catch {
    // ignore storage read error
  }
  return headers;
}

export function formatRelativeTimeVi(isoOrText?: string | null, isPinned?: boolean): string {
  if (isPinned && !isoOrText) return 'Đã ghim';
  if (!isoOrText) return 'Gần đây';
  const date = new Date(isoOrText);
  if (Number.isNaN(date.getTime())) return isoOrText;

  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return 'Vừa xong';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} ngày trước`;
  return date.toLocaleDateString('vi-VN');
}

export function mapBackendPostToForumPost(item: Record<string, unknown>): ForumPost {
  const rawAuthor = (item?.author as Record<string, unknown>) || {};
  const roleStr = String(rawAuthor.role || '');
  const isTeacher =
    roleStr === 'TEACHER' ||
    roleStr === 'Giáo viên' ||
    Boolean(rawAuthor.teacher_profile);
  const isAdmin =
    roleStr === 'SUPER_ADMIN' ||
    roleStr === 'ADMIN' ||
    roleStr === 'Quản trị viên' ||
    roleStr === 'Ban Quản Trị';

  const gradeNumber = Number(item?.grade_level ?? item?.grade ?? 12);
  const rawAttachments = Array.isArray(item?.attachments)
    ? item.attachments
    : Array.isArray(item?.images)
    ? item.images
    : [];
  const attachments = rawAttachments.filter(
    (a: unknown): a is string => typeof a === 'string'
  );

  const subjectObj = item?.subject as Record<string, unknown> | string | undefined;
  const resolvedSubject =
    typeof subjectObj === 'object' && subjectObj !== null
      ? String(subjectObj.name || 'Toán Học')
      : String(item?.subject_name || subjectObj || 'Toán Học');

  const contentStr = String(item?.content || '');
  const isPinned = Boolean(item?.is_pinned ?? item?.isPinned);

  return {
    id: String(item?.id || `post-${Date.now()}`),
    slug: String(item?.slug || item?.id || ''),
    title: String(item?.title || 'Câu hỏi thảo luận'),
    content: contentStr,
    contentPlain: String(item?.content_plain || item?.contentPlain || ''),
    hasMath: Boolean(
      item?.has_math ??
        item?.hasMath ??
        /\$.*\$|\\frac|\\sqrt|\\int|\\lim/.test(contentStr)
    ),
    attachments,
    author: {
      id: rawAuthor.id ? String(rawAuthor.id) : undefined,
      name: String(rawAuthor.fullname || rawAuthor.name || 'Thành viên Schoolify'),
      avatar: String(rawAuthor.avatar_url || rawAuthor.avatar || DEFAULT_AVATAR),
      role: isAdmin
        ? 'Ban Quản Trị'
        : isTeacher
        ? 'Giáo viên'
        : roleStr || 'Học sinh',
      grade: String(
        rawAuthor.grade ||
          (isAdmin
            ? 'Hệ Thống'
            : isTeacher
            ? 'Tổ Chuyên Môn'
            : `Lớp ${gradeNumber}`)
      ),
    },
    subject: resolvedSubject,
    grade: [10, 11, 12].includes(gradeNumber) ? gradeNumber : 12,
    chapterId: item?.chapter_id
      ? Number(item.chapter_id)
      : item?.chapterId
      ? Number(item.chapterId)
      : undefined,
    chapterName: item?.chapter_name
      ? String(item.chapter_name)
      : item?.chapterName
      ? String(item.chapterName)
      : undefined,
    repliesCount: Number(
      item?.comments_count ?? item?.replies_count ?? item?.repliesCount ?? 0
    ),
    likesCount: Number(item?.likes_count ?? item?.likesCount ?? 0),
    viewsCount: Number(item?.views_count ?? item?.viewsCount ?? 0),
    isSolved: Boolean(item?.is_solved ?? item?.isSolved),
    isPinned,
    isLocked: Boolean(item?.is_locked ?? item?.isLocked),
    isLiked: Boolean(item?.is_liked ?? item?.isLiked ?? item?.user_reaction),
    isBookmarked: Boolean(item?.is_bookmarked ?? item?.isBookmarked),
    timeAgo: String(
      item?.timeAgo ||
        formatRelativeTimeVi(
          (item?.created_at || item?.createdAt) as string | undefined,
          isPinned
        )
    ),
    createdAt: (item?.created_at || item?.createdAt) as string | undefined,
    tags: Array.isArray(item?.tags) ? item.tags.map(String) : [],
    initialComments: Array.isArray(item?.initialComments)
      ? (item.initialComments as ForumCommentItem[])
      : undefined,
  };
}

function getSeedPostsFallback(params?: ForumQueryParams): ForumPostsListResponse {
  let list = (ALL_FORUM_SEED_POSTS as unknown as ForumPost[]);

  if (params?.subject && params.subject !== 'Tất cả') {
    list = list.filter((p) => p.subject === params.subject);
  }
  if (params?.grade && params.grade !== 'ALL') {
    list = list.filter((p) => p.grade === Number(params.grade));
  }
  if (params?.status && params.status !== 'ALL') {
    if (params.status === 'UNSOLVED') list = list.filter((p) => !p.isSolved);
    else if (params.status === 'SOLVED') list = list.filter((p) => Boolean(p.isSolved));
    else if (params.status === 'HOT') {
      list = [...list].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const page = Math.max(1, Number(params?.page || 1));
  const limit = Math.max(1, Number(params?.limit || 6));
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = list.slice(start, start + limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

function getSeedPostBySlugOrIdFallback(idOrSlug: string): ForumPost | null {
  const clean = idOrSlug.trim().toLowerCase();
  const found = (ALL_FORUM_SEED_POSTS as unknown as ForumPost[]).find(
    (p) =>
      p.id.toLowerCase() === clean ||
      p.slug?.toLowerCase() === clean ||
      (p.slug && p.slug.toLowerCase().includes(clean)) ||
      (p.slug && clean.includes(p.slug.toLowerCase()))
  );
  return found || null;
}

export const forumService = {
  /**
   * Lấy danh sách câu hỏi diễn đàn từ Backend API (`GET /api/v1/forum/posts`)
   */
  async getPosts(params?: ForumQueryParams): Promise<ForumPostsListResponse> {
    const page = Math.max(1, Number(params?.page || 1));
    const limit = Math.max(1, Number(params?.limit || 6));

    try {
      const qs = new URLSearchParams();
      if (params?.subject && params.subject !== 'Tất cả') {
        qs.set('subject', params.subject);
      }
      if (params?.grade && params.grade !== 'ALL') {
        qs.set('grade', String(params.grade));
      }
      if (params?.status && params.status !== 'ALL') {
        if (params.status === 'UNSOLVED') qs.set('is_solved', 'false');
        else if (params.status === 'SOLVED') qs.set('is_solved', 'true');
        else if (params.status === 'HOT') qs.set('sort', 'hot');
        else if (params.status === 'SAVED') qs.set('bookmarked', 'true');
        qs.set('status', params.status);
      }
      if (params?.search?.trim()) {
        qs.set('search', params.search.trim());
      }
      if (params?.tag?.trim()) {
        qs.set('tag', params.tag.trim());
      }
      qs.set('page', String(page));
      qs.set('limit', String(limit));

      const queryString = qs.toString();
      const url = `/api/v1/forum/posts${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(false),
        cache: 'no-store',
      });

      if (!res.ok) {
        return getSeedPostsFallback(params);
      }

      const json = (await res.json()) as Record<string, unknown>;
      const dataField = json?.data as Record<string, unknown> | unknown[] | undefined;

      const rawArray: Record<string, unknown>[] = Array.isArray(dataField)
        ? (dataField as Record<string, unknown>[])
        : Array.isArray((dataField as Record<string, unknown>)?.items)
        ? ((dataField as Record<string, unknown>).items as Record<string, unknown>[])
        : Array.isArray(json?.items)
        ? (json.items as Record<string, unknown>[])
        : [];

      if (rawArray.length === 0) {
        return getSeedPostsFallback(params);
      }

      const mapped = rawArray.map(mapBackendPostToForumPost);

      const beMeta = (json?.pagination ||
        json?.meta ||
        (dataField as Record<string, unknown>)?.pagination) as
        | Record<string, unknown>
        | undefined;

      if (beMeta && typeof beMeta.total === 'number') {
        const total = Number(beMeta.total);
        const resolvedLimit = Number(beMeta.limit || limit);
        const resolvedPage = Number(beMeta.page || page);
        const totalPages = Math.max(
          1,
          Number(beMeta.totalPages || beMeta.total_pages || Math.ceil(total / resolvedLimit))
        );
        return {
          items: mapped,
          pagination: {
            page: resolvedPage,
            limit: resolvedLimit,
            total,
            totalPages,
          },
        };
      }

      return {
        items: mapped,
        pagination: {
          page,
          limit,
          total: mapped.length,
          totalPages: Math.max(1, Math.ceil(mapped.length / limit)),
        },
      };
    } catch (err) {
      console.warn('[forumService.getPosts] Failed, using seed posts fallback:', err);
      return getSeedPostsFallback(params);
    }
  },

  /**
   * Lấy chi tiết 1 bài thảo luận theo ID hoặc Slug (`GET /api/v1/forum/posts/:idOrSlug`)
   */
  async getPostBySlugOrId(idOrSlug: string): Promise<ForumPost | null> {
    try {
      const res = await fetch(
        `/api/v1/forum/posts/${encodeURIComponent(idOrSlug)}`,
        {
          method: 'GET',
          headers: getAuthHeaders(false),
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const json = (await res.json()) as Record<string, unknown>;
        const dataObj = json?.data as Record<string, unknown> | undefined;
        const raw = (dataObj?.post || dataObj || json?.post) as
          | Record<string, unknown>
          | undefined;
        if (raw) return mapBackendPostToForumPost(raw);
      }
      return getSeedPostBySlugOrIdFallback(idOrSlug);
    } catch (err) {
      console.warn('[forumService.getPostBySlugOrId] Failed, using seed fallback:', err);
      return getSeedPostBySlugOrIdFallback(idOrSlug);
    }
  },

  /**
   * Upload ảnh chụp đề bài / vở nháp (<= 5MB) qua Backend Cloudinary (`POST /api/v1/forum/upload`)
   */
  async uploadImage(file: File): Promise<{
    ok: boolean;
    url?: string;
    publicId?: string;
    message?: string;
  }> {
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return {
        ok: false,
        message: `Ảnh "${file.name}" vượt quá dung lượng tối đa 5MB cho phép!`,
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/v1/forum/upload', {
        method: 'POST',
        headers: getAuthHeaders(false), // Không đặt Content-Type: application/json để trình duyệt tự gắn multipart boundary
        body: formData,
      });

      const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      if (!res.ok) {
        return {
          ok: false,
          message: String(
            json?.message || `Không thể tải ảnh lên Cloudinary (Mã lỗi ${res.status})`
          ),
        };
      }

      const dataObj = (json?.data as Record<string, unknown>) || json || {};
      const resolvedUrl = String(
        dataObj.secure_url || dataObj.url || json?.secure_url || json?.url || ''
      );

      if (!resolvedUrl) {
        return {
          ok: false,
          message: 'Backend không trả về đường dẫn ảnh (secure_url / url).',
        };
      }

      return {
        ok: true,
        url: resolvedUrl,
        publicId: dataObj.public_id ? String(dataObj.public_id) : undefined,
      };
    } catch (err: unknown) {
      return {
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : 'Lỗi kết nối tới API Upload ảnh của Backend.',
      };
    }
  },

  /**
   * Tạo câu hỏi thảo luận mới (`POST /api/v1/forum/posts`)
   */
  async createPost(payload: CreateForumPostPayload): Promise<{
    ok: boolean;
    post?: ForumPost;
    message?: string;
  }> {
    try {
      const res = await fetch('/api/v1/forum/posts', {
        method: 'POST',
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          title: payload.title.trim(),
          content: payload.content.trim(),
          subject: payload.subject,
          grade: payload.grade,
          grade_level: payload.grade,
          chapter_name: payload.chapter_name,
          tags: payload.tags || [payload.subject, `Lớp ${payload.grade}`],
          attachments: payload.attachments || [],
          has_math: /\$.*\$|\\frac|\\sqrt|\\int|\\lim|\\vec|\\begin\{cases\}/.test(
            `${payload.title} ${payload.content}`
          ),
        }),
      });

      const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      if (!res.ok) {
        return {
          ok: false,
          message: String(
            json?.message || `Không thể đăng câu hỏi (Mã lỗi ${res.status})`
          ),
        };
      }

      const dataObj = json?.data as Record<string, unknown> | undefined;
      const rawCreated = (dataObj?.post || dataObj || json?.post) as
        | Record<string, unknown>
        | undefined;
      return {
        ok: true,
        post: rawCreated ? mapBackendPostToForumPost(rawCreated) : undefined,
        message: String(json?.message || 'Đăng câu hỏi thành công!'),
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Không thể kết nối tới máy chủ Diễn Đàn.';
      return {
        ok: false,
        message,
      };
    }
  },

  /**
   * Thả cảm xúc / Like câu hỏi (`POST /api/v1/forum/posts/:id/like`)
   */
  async toggleLikePost(postId: string): Promise<{
    ok: boolean;
    likesCount?: number;
    isLiked?: boolean;
  }> {
    try {
      const res = await fetch(
        `/api/v1/forum/posts/${encodeURIComponent(postId)}/like`,
        {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify({ type: 'LIKE' }),
        }
      );
      if (!res.ok) return { ok: false };
      const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      const dataObj = json?.data as Record<string, unknown> | undefined;
      return {
        ok: true,
        likesCount:
          dataObj?.likes_count !== undefined
            ? Number(dataObj.likes_count)
            : dataObj?.likesCount !== undefined
            ? Number(dataObj.likesCount)
            : undefined,
        isLiked: Boolean(dataObj?.is_liked ?? dataObj?.isLiked),
      };
    } catch {
      return { ok: false };
    }
  },

  /**
   * Lưu / Bỏ lưu câu hỏi (`POST /api/v1/forum/posts/:id/bookmark`)
   */
  async toggleBookmarkPost(postId: string): Promise<{
    ok: boolean;
    isBookmarked?: boolean;
  }> {
    try {
      const res = await fetch(
        `/api/v1/forum/posts/${encodeURIComponent(postId)}/bookmark`,
        {
          method: 'POST',
          headers: getAuthHeaders(true),
        }
      );
      if (!res.ok) return { ok: false };
      const json = (await res.json().catch(() => null)) as Record<string, unknown> | null;
      const dataObj = json?.data as Record<string, unknown> | undefined;
      return {
        ok: true,
        isBookmarked: Boolean(dataObj?.is_bookmarked ?? dataObj?.isBookmarked),
      };
    } catch {
      return { ok: false };
    }
  },
};
