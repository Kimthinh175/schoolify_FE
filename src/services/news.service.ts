import { NewsArticle, NewsCategory, NewsStatus, NewsTocItem } from '@/types';
import { MOCK_NEWS_ARTICLES, MOCK_NEWS_CATEGORIES } from './mock/news-data';

/** Chuyển chuỗi tiếng Việt có dấu thành không dấu (phục vụ tìm kiếm & tạo slug) */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/** Tạo slug chuẩn SEO từ tiêu đề tiếng Việt */
export function slugify(text: string): string {
  return removeVietnameseTones(text)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Tự động trích xuất Mục lục (Table of Contents) từ các tiêu đề ## / ### hoặc <h2> / <h3> */
export function extractTableOfContents(content: string): NewsTocItem[] {
  if (!content) return [];
  const items: NewsTocItem[] = [];
  const usedIds = new Set<string>();

  const makeUniqueId = (rawText: string, index: number) => {
    const base = slugify(rawText) || `muc-${index + 1}`;
    let candidate = base;
    let count = 2;
    while (usedIds.has(candidate)) {
      candidate = `${base}-${count++}`;
    }
    usedIds.add(candidate);
    return candidate;
  };

  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // Markdown headings: ##, ###, ####
    const mdMatch = trimmed.match(/^(#{2,4})\s+(.+)$/);
    if (mdMatch) {
      const level = mdMatch[1].length as 2 | 3 | 4;
      const text = mdMatch[2].replace(/[*_`~]/g, '').trim();
      if (text) {
        items.push({ id: makeUniqueId(text, idx), text, level });
      }
      return;
    }

    // HTML headings: <h2>...</h2>, <h3>...</h3>
    const htmlMatch = trimmed.match(/<h([2-4])[^>]*>(.*?)<\/h\1>/i);
    if (htmlMatch) {
      const level = Number(htmlMatch[1]) as 2 | 3 | 4;
      const text = htmlMatch[2].replace(/<[^>]+>/g, '').trim();
      if (text) {
        items.push({ id: makeUniqueId(text, idx), text, level });
      }
    }
  });

  return items;
}

/** Tính số lượng từ và thời gian đọc ước tính (trung bình 200 từ/phút) */
export function calculateReadingMetrics(content: string): {
  wordCount: number;
  readingTimeMinutes: number;
} {
  if (!content) return { wordCount: 0, readingTimeMinutes: 1 };
  const plain = content
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`~>-]/g, ' ')
    .trim();
  const words = plain ? plain.split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 180));
  return { wordCount: words, readingTimeMinutes };
}

/** Định dạng ngày tiếng Việt thân thiện: "04 Tháng 10, 2026" */
export function formatVietnameseDate(isoDate?: string | null): string {
  if (!isoDate) return 'Chưa xuất bản';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day} Tháng ${month}, ${year}`;
}

async function fetchNewsJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

/** Kiểm tra bài viết SCHEDULED đã tới giờ xuất bản hay chưa */
function isArticleEffectivelyPublished(article: NewsArticle, nowMs = Date.now()): boolean {
  if (article.deleted_at) return false;
  if (article.status === 'PUBLISHED') return true;
  if (article.status === 'SCHEDULED' && article.scheduled_at) {
    const schedMs = new Date(article.scheduled_at).getTime();
    return !Number.isNaN(schedMs) && schedMs <= nowMs;
  }
  return false;
}

function hydrateArticle(a: NewsArticle, catMap: Map<string, NewsCategory>, nowMs: number): NewsArticle {
  const effectivePublished = isArticleEffectivelyPublished(a, nowMs);
  const normalizedStatus: NewsStatus =
    a.status === 'SCHEDULED' && effectivePublished ? 'PUBLISHED' : a.status;
  return {
    ...a,
    status: normalizedStatus,
    published_at:
      normalizedStatus === 'PUBLISHED' && !a.published_at
        ? a.scheduled_at || a.created_at
        : a.published_at,
    category: a.category || catMap.get(a.category_id),
    table_of_contents:
      a.table_of_contents && a.table_of_contents.length > 0
        ? a.table_of_contents
        : extractTableOfContents(a.content || ''),
  };
}

export const newsService = {
  async getCategories(onlyActive = true): Promise<NewsCategory[]> {
    const [apiCats, apiArticles] = await Promise.all([
      fetchNewsJson<NewsCategory[]>(`/api/v1/news/categories?onlyActive=${onlyActive}`),
      fetchNewsJson<NewsArticle[]>('/api/v1/news/articles?onlyPublic=false'),
    ]);

    const baseCats = apiCats && apiCats.length > 0 ? apiCats : MOCK_NEWS_CATEGORIES;
    const articles = apiArticles && apiArticles.length > 0 ? apiArticles : MOCK_NEWS_ARTICLES;
    const nowMs = Date.now();

    return baseCats
      .filter((c) => (onlyActive ? c.is_active : true))
      .map((cat) => {
        const count = articles.filter(
          (a) =>
            a.category_id === cat.id &&
            (onlyActive ? isArticleEffectivelyPublished(a, nowMs) : !a.deleted_at)
        ).length;
        return { ...cat, articles_count: cat.articles_count ?? count };
      })
      .sort((a, b) => a.order_index - b.order_index);
  },

  async getArticles(filters?: {
    categoryId?: string;
    categorySlug?: string;
    search?: string;
    tag?: string;
    status?: NewsStatus | 'ALL';
    onlyPublic?: boolean;
  }): Promise<NewsArticle[]> {
    const onlyPublic = filters?.onlyPublic ?? true;

    const [apiCats, apiArticles] = await Promise.all([
      fetchNewsJson<NewsCategory[]>('/api/v1/news/categories?onlyActive=false'),
      fetchNewsJson<NewsArticle[]>(`/api/v1/news/articles?onlyPublic=${onlyPublic}`),
    ]);

    const cats = apiCats && apiCats.length > 0 ? apiCats : MOCK_NEWS_CATEGORIES;
    const rawArticles = apiArticles && apiArticles.length > 0 ? apiArticles : MOCK_NEWS_ARTICLES;

    const catMap = new Map(cats.map((c) => [c.id, c]));
    const nowMs = Date.now();

    let result = rawArticles
      .filter((a) => !a.deleted_at)
      .map((a) => hydrateArticle(a, catMap, nowMs));

    if (onlyPublic) {
      result = result.filter((a) => a.status === 'PUBLISHED');
    } else if (filters?.status && filters.status !== 'ALL') {
      result = result.filter((a) => a.status === filters.status);
    }

    if (filters?.categoryId && filters.categoryId !== 'ALL') {
      result = result.filter((a) => a.category_id === filters.categoryId);
    }

    if (filters?.categorySlug && filters.categorySlug !== 'ALL') {
      result = result.filter((a) => a.category?.slug === filters.categorySlug);
    }

    if (filters?.tag) {
      const targetTag = removeVietnameseTones(filters.tag);
      result = result.filter((a) =>
        (a.tags || []).some((t) => removeVietnameseTones(t) === targetTag)
      );
    }

    if (filters?.search?.trim()) {
      const q = removeVietnameseTones(filters.search);
      result = result.filter((a) => {
        const haystack =
          a.search_text ||
          removeVietnameseTones(
            `${a.title} ${a.excerpt} ${(a.tags || []).join(' ')} ${a.author_name} ${a.category?.name || ''}`
          );
        return haystack.includes(q);
      });
    }

    result.sort((a, b) => {
      if (onlyPublic && a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      const timeA = new Date(a.published_at || a.created_at).getTime();
      const timeB = new Date(b.published_at || b.created_at).getTime();
      return timeB - timeA;
    });

    return result;
  },

  async getArticleBySlug(slug: string, incrementView = true): Promise<NewsArticle | null> {
    const apiFound = await fetchNewsJson<NewsArticle>(
      `/api/v1/news/articles/${encodeURIComponent(slug)}?onlyPublic=false`
    );
    if (apiFound) {
      const cats = await this.getCategories(false);
      const catMap = new Map(cats.map((c) => [c.id, c]));
      return hydrateArticle(apiFound, catMap, Date.now());
    }

    const all = await this.getArticles({ onlyPublic: false });
    const found = all.find((a) => a.slug === slug || a.id === slug);
    if (!found) return null;

    if (incrementView) {
      found.view_count = (found.view_count || 0) + 1;
    }

    return found;
  },

  async getRelatedArticles(article: NewsArticle, limit = 3): Promise<NewsArticle[]> {
    const published = await this.getArticles({ onlyPublic: true });
    const candidates = published.filter((a) => a.id !== article.id);

    const scored = candidates.map((item) => {
      let score = 0;
      if (item.category_id === article.category_id) score += 3;
      const sharedTags = (item.tags || []).filter((t) => (article.tags || []).includes(t)).length;
      score += sharedTags * 2;
      return { item, score };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.item.published_at || b.item.created_at).getTime() -
        new Date(a.item.published_at || a.item.created_at).getTime()
      );
    });

    return scored.slice(0, limit).map((s) => s.item);
  },

  async toggleLikeArticle(id: string): Promise<number> {
    const updated = await fetchNewsJson<NewsArticle>(
      `/api/v1/news/articles/${encodeURIComponent(id)}/like`,
      { method: 'POST', body: JSON.stringify({}) }
    );
    if (updated && typeof updated.like_count === 'number') {
      return updated.like_count;
    }
    const all = await this.getArticles({ onlyPublic: false });
    const target = all.find((a) => a.id === id);
    return target ? (target.like_count || 0) + 1 : 0;
  },

  // ── ADMIN CMS: QUẢN TRỊ BÀI VIẾT ──

  async updateArticleFlags(
    id: string,
    patch: Partial<
      Pick<
        NewsArticle,
        | 'is_featured'
        | 'is_pinned'
        | 'is_breaking'
        | 'status'
        | 'scheduled_at'
        | 'published_at'
      >
    >
  ): Promise<NewsArticle | null> {
    const updatedPayload: Partial<NewsArticle> = {
      ...patch,
      updated_at: new Date().toISOString(),
    };
    if (patch.status === 'PUBLISHED' && !patch.published_at) {
      updatedPayload.published_at = new Date().toISOString();
    }
    return fetchNewsJson<NewsArticle>(`/api/v1/news/articles/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(updatedPayload),
    });
  },

  async saveArticle(
    payload: Partial<NewsArticle> & { title: string; category_id: string }
  ): Promise<NewsArticle> {
    const nowIso = new Date().toISOString();
    const slug = payload.slug?.trim() ? slugify(payload.slug) : slugify(payload.title);
    const content = payload.content || '';
    const metrics = calculateReadingMetrics(content);
    const toc = extractTableOfContents(content);
    const tags = payload.tags || [];
    const author_name = payload.author_name?.trim() || 'Ban Biên Tập Schoolify';
    const excerpt = payload.excerpt?.trim() || '';
    const status: NewsStatus = payload.status || 'DRAFT';

    const record: NewsArticle = {
      id: payload.id || `news-${Date.now()}`,
      category_id: payload.category_id,
      title: payload.title.trim(),
      slug,
      excerpt,
      content,
      table_of_contents: toc,
      thumbnail_url:
        payload.thumbnail_url?.trim() ||
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80',
      cover_image_url:
        payload.cover_image_url?.trim() ||
        payload.thumbnail_url?.trim() ||
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1400&auto=format&fit=crop&q=80',
      image_alt: payload.image_alt?.trim() || payload.title.trim(),
      image_caption: payload.image_caption?.trim() || null,
      attachments: payload.attachments || [],
      reading_time_minutes: payload.reading_time_minutes || metrics.readingTimeMinutes,
      word_count: metrics.wordCount,
      view_count: payload.view_count ?? 0,
      like_count: payload.like_count ?? 0,
      share_count: payload.share_count ?? 0,
      bookmark_count: payload.bookmark_count ?? 0,
      tags,
      grade_levels: payload.grade_levels || [12],
      subject_slugs: payload.subject_slugs || ['toan-hoc'],
      target_roles: payload.target_roles || ['STUDENT', 'TEACHER'],
      search_text: removeVietnameseTones(
        `${payload.title} ${excerpt} ${tags.join(' ')} ${author_name}`
      ),
      related_article_ids: payload.related_article_ids || [],
      meta_title: payload.meta_title?.trim() || payload.title.trim().slice(0, 70),
      meta_description: payload.meta_description?.trim() || excerpt.slice(0, 160),
      meta_keywords: payload.meta_keywords || tags,
      focus_keyword: payload.focus_keyword?.trim() || tags[0] || null,
      canonical_url: payload.canonical_url?.trim() || null,
      og_title: payload.og_title?.trim() || payload.meta_title?.trim() || payload.title.trim(),
      og_description: payload.og_description?.trim() || excerpt.slice(0, 200),
      og_image_url: payload.og_image_url?.trim() || payload.thumbnail_url?.trim() || null,
      structured_data: payload.structured_data || null,
      is_indexable: payload.is_indexable ?? true,
      author_id: payload.author_id || null,
      author_name,
      author_avatar: payload.author_avatar || null,
      author_role: payload.author_role?.trim() || 'Ban Biên Tập Giáo Dục',
      author_bio: payload.author_bio?.trim() || null,
      source_name: payload.source_name?.trim() || null,
      source_url: payload.source_url?.trim() || null,
      status,
      is_featured: Boolean(payload.is_featured),
      is_pinned: Boolean(payload.is_pinned),
      is_breaking: Boolean(payload.is_breaking),
      allow_comments: payload.allow_comments ?? true,
      published_at:
        status === 'PUBLISHED'
          ? payload.published_at || nowIso
          : payload.published_at || null,
      scheduled_at: status === 'SCHEDULED' ? payload.scheduled_at || null : null,
      created_at: payload.created_at || nowIso,
      updated_at: nowIso,
      deleted_at: null,
    };

    const isUpdate = Boolean(payload.id);
    const saved = await fetchNewsJson<NewsArticle>(
      isUpdate ? `/api/v1/news/articles/${encodeURIComponent(payload.id!)}` : '/api/v1/news/articles',
      {
        method: isUpdate ? 'PATCH' : 'POST',
        body: JSON.stringify(record),
      }
    );

    return saved || record;
  },

  async deleteArticle(id: string): Promise<void> {
    await fetchNewsJson(`/api/v1/news/articles/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // ── ADMIN CMS: QUẢN TRỊ CHUYÊN MỤC ──

  async saveCategory(
    payload: Partial<NewsCategory> & { name: string }
  ): Promise<NewsCategory> {
    const nowIso = new Date().toISOString();
    const slug = payload.slug?.trim() ? slugify(payload.slug) : slugify(payload.name);

    const record: NewsCategory = {
      id: payload.id || `cat-${Date.now()}`,
      parent_id: payload.parent_id || null,
      name: payload.name.trim(),
      slug,
      description: payload.description?.trim() || '',
      icon: payload.icon || 'Newspaper',
      color: payload.color || '#00B8DD',
      cover_image_url: payload.cover_image_url || null,
      order_index: Number(payload.order_index ?? 1),
      is_active: payload.is_active ?? true,
      is_featured: payload.is_featured ?? true,
      meta_title: payload.meta_title?.trim() || `${payload.name.trim()} | Schoolify`,
      meta_description: payload.meta_description?.trim() || payload.description?.trim() || '',
      meta_keywords: payload.meta_keywords || [],
      canonical_url: payload.canonical_url || null,
      og_image_url: payload.og_image_url || null,
      is_indexable: payload.is_indexable ?? true,
      created_at: payload.created_at || nowIso,
      updated_at: nowIso,
    };

    const isUpdate = Boolean(payload.id);
    const saved = await fetchNewsJson<NewsCategory>(
      isUpdate ? `/api/v1/news/categories/${encodeURIComponent(payload.id!)}` : '/api/v1/news/categories',
      {
        method: isUpdate ? 'PATCH' : 'POST',
        body: JSON.stringify(record),
      }
    );
    return saved || record;
  },

  async toggleCategoryFlags(
    id: string,
    patch: Partial<Pick<NewsCategory, 'is_active' | 'is_featured' | 'order_index'>>
  ): Promise<NewsCategory | null> {
    return fetchNewsJson<NewsCategory>(`/api/v1/news/categories/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
  },

  async deleteCategory(id: string): Promise<{ ok: boolean; message?: string }> {
    const res = await fetch(`/api/v1/news/categories/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    }).catch(() => null);

    if (!res) return { ok: false, message: 'Không thể kết nối máy chủ để xoá chuyên mục.' };
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      return { ok: false, message: json?.message || 'Không thể xoá chuyên mục.' };
    }
    return { ok: true };
  },
};

