import { demoDb } from '@/lib/demo-db';
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

let seedPromise: Promise<void> | null = null;

async function ensureSeeded(): Promise<void> {
  if (seedPromise) return seedPromise;
  seedPromise = (async () => {
    try {
      const [existingCats, existingArticles] = await Promise.all([
        demoDb.list<NewsCategory>('newsCategories'),
        demoDb.list<NewsArticle>('newsArticles'),
      ]);

      if (existingCats.length === 0) {
        for (const cat of [...MOCK_NEWS_CATEGORIES].reverse()) {
          await demoDb.create('newsCategories', cat);
        }
      }

      if (existingArticles.length === 0) {
        for (const art of [...MOCK_NEWS_ARTICLES].reverse()) {
          const toc = extractTableOfContents(art.content);
          const search_text = removeVietnameseTones(
            `${art.title} ${art.excerpt} ${(art.tags || []).join(' ')} ${art.author_name}`
          );
          await demoDb.create('newsArticles', {
            ...art,
            table_of_contents: toc,
            search_text,
          });
        }
      } else {
        // Bổ sung các bài viết mẫu mới (như DRAFT / SCHEDULED) nếu chưa tồn tại trong DB
        const existingIds = new Set(existingArticles.map((a) => a.id));
        for (const art of MOCK_NEWS_ARTICLES) {
          if (!existingIds.has(art.id)) {
            const toc = extractTableOfContents(art.content);
            const search_text = removeVietnameseTones(
              `${art.title} ${art.excerpt} ${(art.tags || []).join(' ')} ${art.author_name}`
            );
            await demoDb.create('newsArticles', {
              ...art,
              table_of_contents: toc,
              search_text,
            });
          }
        }
      }
    } catch {
      // Fallback sang dữ liệu bộ nhớ nếu môi trường hiện tại không ghi được file
    }
  })();
  return seedPromise;
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

export const newsService = {
  async getCategories(onlyActive = true): Promise<NewsCategory[]> {
    await ensureSeeded();
    try {
      const [cats, articles] = await Promise.all([
        demoDb.list<NewsCategory>('newsCategories'),
        demoDb.list<NewsArticle>('newsArticles'),
      ]);
      const baseCats = cats.length > 0 ? cats : MOCK_NEWS_CATEGORIES;
      const nowMs = Date.now();

      const enriched = baseCats
        .filter((c) => (onlyActive ? c.is_active : true))
        .map((cat) => {
          const count = articles.filter(
            (a) =>
              a.category_id === cat.id &&
              (onlyActive ? isArticleEffectivelyPublished(a, nowMs) : !a.deleted_at)
          ).length;
          return { ...cat, articles_count: count };
        })
        .sort((a, b) => a.order_index - b.order_index);

      return enriched;
    } catch {
      return MOCK_NEWS_CATEGORIES.filter((c) => (onlyActive ? c.is_active : true));
    }
  },

  async getArticles(filters?: {
    categoryId?: string;
    categorySlug?: string;
    search?: string;
    tag?: string;
    status?: NewsStatus | 'ALL';
    onlyPublic?: boolean;
  }): Promise<NewsArticle[]> {
    await ensureSeeded();
    const onlyPublic = filters?.onlyPublic ?? true;

    let cats: NewsCategory[] = MOCK_NEWS_CATEGORIES;
    let rawArticles: NewsArticle[] = MOCK_NEWS_ARTICLES;

    try {
      const [dbCats, dbArts] = await Promise.all([
        demoDb.list<NewsCategory>('newsCategories'),
        demoDb.list<NewsArticle>('newsArticles'),
      ]);
      if (dbCats.length > 0) cats = dbCats;
      if (dbArts.length > 0) rawArticles = dbArts;
    } catch {
      // fallback mock
    }

    const catMap = new Map(cats.map((c) => [c.id, c]));
    const nowMs = Date.now();

    let result = rawArticles
      .filter((a) => !a.deleted_at)
      .map((a) => {
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
          category: catMap.get(a.category_id),
          table_of_contents:
            a.table_of_contents && a.table_of_contents.length > 0
              ? a.table_of_contents
              : extractTableOfContents(a.content),
        };
      });

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

    // Sắp xếp: ưu tiên bài ghim (is_pinned) khi xem public, sau đó theo ngày xuất bản mới nhất
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
    const all = await this.getArticles({ onlyPublic: false });
    const found = all.find((a) => a.slug === slug || a.id === slug);
    if (!found) return null;

    if (incrementView) {
      const nextViews = (found.view_count || 0) + 1;
      found.view_count = nextViews;
      demoDb.patch<NewsArticle>('newsArticles', found.id, { view_count: nextViews }).catch(() => {});
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
    const all = await this.getArticles({ onlyPublic: false });
    const target = all.find((a) => a.id === id);
    if (!target) return 0;
    const nextLikes = (target.like_count || 0) + 1;
    await demoDb.patch<NewsArticle>('newsArticles', id, { like_count: nextLikes }).catch(() => {});
    return nextLikes;
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
    await ensureSeeded();
    const updatedPayload: Partial<NewsArticle> = {
      ...patch,
      updated_at: new Date().toISOString(),
    };
    if (patch.status === 'PUBLISHED' && !patch.published_at) {
      updatedPayload.published_at = new Date().toISOString();
    }
    try {
      const updated = await demoDb.patch<NewsArticle>('newsArticles', id, updatedPayload);
      return updated;
    } catch {
      return null;
    }
  },

  async saveArticle(
    payload: Partial<NewsArticle> & { title: string; category_id: string }
  ): Promise<NewsArticle> {
    await ensureSeeded();
    const nowIso = new Date().toISOString();
    const id = payload.id || `news-${Date.now()}`;
    const slug = payload.slug?.trim() ? slugify(payload.slug) : slugify(payload.title);
    const content = payload.content || '';
    const metrics = calculateReadingMetrics(content);
    const toc = extractTableOfContents(content);
    const tags = payload.tags || [];
    const author_name = payload.author_name?.trim() || 'Ban Biên Tập Schoolify';
    const excerpt = payload.excerpt?.trim() || '';
    const status: NewsStatus = payload.status || 'DRAFT';

    const record: NewsArticle = {
      id,
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

    try {
      await demoDb.create<NewsArticle>('newsArticles', record);
    } catch {
      // ignore if offline
    }
    return record;
  },

  async deleteArticle(id: string): Promise<void> {
    await ensureSeeded();
    try {
      await demoDb.remove('newsArticles', id);
    } catch {
      // ignore
    }
  },

  // ── ADMIN CMS: QUẢN TRỊ CHUYÊN MỤC ──

  async saveCategory(
    payload: Partial<NewsCategory> & { name: string }
  ): Promise<NewsCategory> {
    await ensureSeeded();
    const nowIso = new Date().toISOString();
    const id = payload.id || `cat-${Date.now()}`;
    const slug = payload.slug?.trim() ? slugify(payload.slug) : slugify(payload.name);

    const record: NewsCategory = {
      id,
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

    try {
      await demoDb.create<NewsCategory>('newsCategories', record);
    } catch {
      // ignore
    }
    return record;
  },

  async toggleCategoryFlags(
    id: string,
    patch: Partial<Pick<NewsCategory, 'is_active' | 'is_featured' | 'order_index'>>
  ): Promise<NewsCategory | null> {
    await ensureSeeded();
    try {
      return await demoDb.patch<NewsCategory>('newsCategories', id, {
        ...patch,
        updated_at: new Date().toISOString(),
      });
    } catch {
      return null;
    }
  },

  async deleteCategory(id: string): Promise<{ ok: boolean; message?: string }> {
    await ensureSeeded();
    const articles = await this.getArticles({ onlyPublic: false });
    const usedCount = articles.filter((a) => a.category_id === id).length;
    if (usedCount > 0) {
      return {
        ok: false,
        message: `Không thể xoá chuyên mục đang chứa ${usedCount} bài viết. Vui lòng chuyển bài viết sang chuyên mục khác hoặc ẩn chuyên mục này.`,
      };
    }
    try {
      await demoDb.remove('newsCategories', id);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Lỗi khi xoá chuyên mục.' };
    }
  },
};

