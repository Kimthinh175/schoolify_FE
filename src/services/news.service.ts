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
};

