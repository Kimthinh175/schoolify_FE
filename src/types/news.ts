export type NewsStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'HIDDEN'
  | 'REJECTED'
  | 'ARCHIVED';

export interface NewsTocItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

export interface NewsAttachment {
  title: string;
  file_url: string;
  file_type: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP' | 'IMAGE';
  file_size_bytes?: number;
}

export interface NewsCategory {
  id: string;
  parent_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  cover_image_url?: string | null;
  order_index: number;
  is_active: boolean;
  is_featured: boolean;

  // SEO fields
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[];
  canonical_url?: string | null;
  og_image_url?: string | null;
  is_indexable: boolean;

  // Timestamps & Relations
  created_at: string;
  updated_at: string;
  parent?: NewsCategory | null;
  children?: NewsCategory[];
  articles_count?: number;
}

export interface NewsArticle {
  id: string;
  category_id: string;

  // 1. Nội dung cốt lõi & đọc bài
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  table_of_contents?: NewsTocItem[] | null;

  // 2. Media & Accessibility
  thumbnail_url: string;
  cover_image_url?: string | null;
  image_alt?: string | null;
  image_caption?: string | null;
  attachments?: NewsAttachment[] | null;

  // 3. Chỉ số đọc & tương tác
  reading_time_minutes: number;
  word_count: number;
  view_count: number;
  like_count: number;
  share_count: number;
  bookmark_count: number;

  // 4. Phân loại giáo dục & Tìm kiếm
  tags: string[];
  grade_levels: number[];
  subject_slugs: string[];
  target_roles: string[];
  search_text?: string | null;
  related_article_ids?: string[];

  // 5. Chuẩn SEO & Open Graph / Schema.org
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords: string[];
  focus_keyword?: string | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  structured_data?: Record<string, unknown> | null;
  is_indexable: boolean;

  // 6. Tác giả & Nguồn trích dẫn
  author_id?: string | null;
  author_name: string;
  author_avatar?: string | null;
  author_role?: string | null;
  author_bio?: string | null;
  source_name?: string | null;
  source_url?: string | null;

  // 7. Quản trị xuất bản & Kiểm duyệt
  status: NewsStatus;
  is_featured: boolean;
  is_pinned: boolean;
  is_breaking: boolean;
  allow_comments: boolean;
  reviewer_id?: string | null;
  rejected_reason?: string | null;
  published_at?: string | null;
  scheduled_at?: string | null;
  last_edited_by?: string | null;

  // 8. Timestamps & Relations
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  category?: NewsCategory;
}

