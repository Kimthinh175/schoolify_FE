'use client';

import * as React from 'react';
import {
  FileText,
  Globe,
  CalendarClock,
  Sparkles,
  Eye,
  Edit3,
  ListOrdered,
  CheckCircle2,
  AlertCircle,
  Send,
  Save,
  Clock,
  Tag,
  Image as ImageIcon,
  Heading2,
  Heading3,
  Bold,
  List,
  Quote,
  Sigma,
  RefreshCw,
  Star,
  Pin,
  Flame,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { NewsArticle, NewsCategory, NewsStatus } from '@/types';
import {
  newsService,
  slugify,
  extractTableOfContents,
  calculateReadingMetrics,
} from '@/services/news.service';
import { ArticleContentRenderer } from './ArticleContentRenderer';

interface AdminNewsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: NewsCategory[];
  editingArticle: NewsArticle | null;
  onSaved: (saved: NewsArticle) => void;
}

type EditorTab = 'CONTENT' | 'SEO' | 'PUBLISH';

const PRESET_THUMBNAILS = [
  {
    label: 'Ôn thi THPT',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Công nghệ AI',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Toán học Oxyz',
    url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1000&auto=format&fit=crop&q=80',
  },
  {
    label: 'Sự kiện Học sinh',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop&q=80',
  },
];

const SUGGESTED_TAGS = [
  'THPT 2026',
  'Trắc nghiệm Đúng/Sai',
  'GDPT 2018',
  'Toán 12',
  'Vật Lý 12',
  'AI Giáo Dục',
  'Hình học Oxyz',
  'Bảng Vàng',
];

function toDatetimeLocalValue(iso?: string | null): string {
  const date = iso ? new Date(iso) : new Date(Date.now() + 24 * 3600 * 1000);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

export function AdminNewsEditorModal({
  isOpen,
  onClose,
  categories,
  editingArticle,
  onSaved,
}: AdminNewsEditorModalProps) {
  const [activeTab, setActiveTab] = React.useState<EditorTab>('CONTENT');
  const [previewMode, setPreviewMode] = React.useState<boolean>(false);
  const [serpDevice, setSerpDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // 1. Content fields
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);
  const [categoryId, setCategoryId] = React.useState('');
  const [excerpt, setExcerpt] = React.useState('');
  const [content, setContent] = React.useState('');
  const [thumbnailUrl, setThumbnailUrl] = React.useState(PRESET_THUMBNAILS[0].url);
  const [imageAlt, setImageAlt] = React.useState('');
  const [imageCaption, setImageCaption] = React.useState('');
  const [authorName, setAuthorName] = React.useState('Ban Khảo Thí Schoolify');
  const [authorRole, setAuthorRole] = React.useState('Hội đồng Chuyên môn & Đánh giá Năng lực');
  const [sourceName, setSourceName] = React.useState('');

  // 2. SEO & Taxonomy fields
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [focusKeyword, setFocusKeyword] = React.useState('');
  const [canonicalUrl, setCanonicalUrl] = React.useState('');
  const [isIndexable, setIsIndexable] = React.useState(true);
  const [tags, setTags] = React.useState<string[]>(['THPT 2026']);
  const [tagInput, setTagInput] = React.useState('');
  const [gradeLevels, setGradeLevels] = React.useState<number[]>([12]);

  // 3. Publishing & Schedule fields
  const [status, setStatus] = React.useState<NewsStatus>('PUBLISHED');
  const [scheduledLocal, setScheduledLocal] = React.useState<string>(() =>
    toDatetimeLocalValue()
  );
  const [isFeatured, setIsFeatured] = React.useState(false);
  const [isPinned, setIsPinned] = React.useState(false);
  const [isBreaking, setIsBreaking] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  // Khởi tạo dữ liệu khi mở Modal (Thêm mới hoặc Chỉnh sửa)
  React.useEffect(() => {
    if (!isOpen) return;
    setActiveTab('CONTENT');
    setPreviewMode(false);

    if (editingArticle) {
      setTitle(editingArticle.title || '');
      setSlug(editingArticle.slug || '');
      setSlugManuallyEdited(true);
      setCategoryId(editingArticle.category_id || categories[0]?.id || 'cat-thpt');
      setExcerpt(editingArticle.excerpt || '');
      setContent(editingArticle.content || '');
      setThumbnailUrl(editingArticle.thumbnail_url || PRESET_THUMBNAILS[0].url);
      setImageAlt(editingArticle.image_alt || '');
      setImageCaption(editingArticle.image_caption || '');
      setAuthorName(editingArticle.author_name || 'Ban Biên Tập Schoolify');
      setAuthorRole(editingArticle.author_role || 'Ban Biên Tập Giáo Dục');
      setSourceName(editingArticle.source_name || '');

      setMetaTitle(editingArticle.meta_title || '');
      setMetaDescription(editingArticle.meta_description || '');
      setFocusKeyword(editingArticle.focus_keyword || '');
      setCanonicalUrl(editingArticle.canonical_url || '');
      setIsIndexable(editingArticle.is_indexable ?? true);
      setTags(editingArticle.tags || []);
      setGradeLevels(
        editingArticle.grade_levels && editingArticle.grade_levels.length > 0
          ? editingArticle.grade_levels
          : [12]
      );

      setStatus(editingArticle.status || 'DRAFT');
      setScheduledLocal(toDatetimeLocalValue(editingArticle.scheduled_at));
      setIsFeatured(Boolean(editingArticle.is_featured));
      setIsPinned(Boolean(editingArticle.is_pinned));
      setIsBreaking(Boolean(editingArticle.is_breaking));
    } else {
      setTitle('');
      setSlug('');
      setSlugManuallyEdited(false);
      setCategoryId(categories[0]?.id || 'cat-thpt');
      setExcerpt('');
      setContent(
        `## 1. Tổng quan nội dung trọng tâm\n\nNhập nội dung mở đầu phân tích chuyên đề hoặc thông tin kỳ thi tại đây...\n\n### Các điểm mới cần lưu ý\n\n- Ý trọng tâm thứ nhất kèm công thức minh họa $f'(x) = 3x^2 - 6x$.\n- Ý trọng tâm thứ hai định hướng phương pháp ôn luyện.\n\n## 2. Hướng dẫn lộ trình thực hành trên Schoolify\n\n1. Bước 1: Ôn tập lý thuyết nền tảng theo từng chương.\n2. Bước 2: Luyện đề ma trận thích ứng trong Phòng Thi Ảo.`
      );
      setThumbnailUrl(PRESET_THUMBNAILS[0].url);
      setImageAlt('');
      setImageCaption('');
      setAuthorName('Ban Khảo Thí Schoolify');
      setAuthorRole('Hội đồng Chuyên môn & Đánh giá Năng lực');
      setSourceName('');

      setMetaTitle('');
      setMetaDescription('');
      setFocusKeyword('');
      setCanonicalUrl('');
      setIsIndexable(true);
      setTags(['THPT 2026']);
      setGradeLevels([12]);

      setStatus('PUBLISHED');
      setScheduledLocal(toDatetimeLocalValue());
      setIsFeatured(false);
      setIsPinned(false);
      setIsBreaking(false);
    }
  }, [isOpen, editingArticle, categories]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // Tự động trích xuất Mục lục & Chỉ số đọc theo thời gian thực
  const liveToc = React.useMemo(() => extractTableOfContents(content), [content]);
  const liveMetrics = React.useMemo(() => calculateReadingMetrics(content), [content]);

  // Chấm điểm chuẩn SEO theo thời gian thực (0 - 100 điểm)
  const seoChecks = React.useMemo(() => {
    const effectiveMetaTitle = (metaTitle || title).trim();
    const effectiveMetaDesc = (metaDescription || excerpt).trim();
    const kw = focusKeyword.trim().toLowerCase();

    const hasKeyword = kw.length >= 2;
    const keywordInTitle =
      hasKeyword && effectiveMetaTitle.toLowerCase().includes(kw);
    const goodMetaDescLength =
      effectiveMetaDesc.length >= 70 && effectiveMetaDesc.length <= 165;
    const hasStructuredHeadings = liveToc.length >= 2;
    const hasImageAlt = Boolean((imageAlt || title).trim() && thumbnailUrl.trim());

    const items = [
      {
        ok: hasKeyword,
        label: 'Đã khai báo Từ khóa trọng tâm (Focus Keyword)',
      },
      {
        ok: keywordInTitle,
        label: 'Từ khóa trọng tâm xuất hiện trong Tiêu đề SEO',
      },
      {
        ok: goodMetaDescLength,
        label: `Độ dài Meta Description tối ưu (${effectiveMetaDesc.length}/160 ký tự)`,
      },
      {
        ok: hasStructuredHeadings,
        label: `Cấu trúc bài viết có tối thiểu 2 thẻ H2/H3 tạo Mục lục (${liveToc.length} mục)`,
      },
      {
        ok: hasImageAlt,
        label: 'Đã có Ảnh đại diện và thẻ Alt mô tả ảnh chuẩn SEO',
      },
    ];

    const score = items.filter((i) => i.ok).length * 20;
    return { score, items, effectiveMetaTitle, effectiveMetaDesc };
  }, [metaTitle, title, metaDescription, excerpt, focusKeyword, liveToc.length, imageAlt, thumbnailUrl]);

  // Chèn nhanh cú pháp vào khung soạn thảo
  const insertSnippet = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => `${prev}\n${snippet}`);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = `${content.slice(0, start)}${snippet}${content.slice(end)}`;
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length, start + snippet.length);
    }, 10);
  };

  const handleAddTag = (raw: string) => {
    const cleaned = raw.trim().replace(/^#/, '');
    if (!cleaned) return;
    if (!tags.includes(cleaned)) {
      setTags((prev) => [...prev, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const toggleGrade = (grade: number) => {
    setGradeLevels((prev) =>
      prev.includes(grade)
        ? prev.length > 1
          ? prev.filter((g) => g !== grade)
          : prev
        : [...prev, grade].sort()
    );
  };

  // Lưu bài viết với trạng thái cụ thể (DRAFT / SCHEDULED / PUBLISHED)
  const handleSaveWithStatus = async (targetStatus: NewsStatus) => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết!');
      setActiveTab('CONTENT');
      return;
    }
    if (!categoryId) {
      toast.error('Vui lòng chọn chuyên mục cho bài viết!');
      setActiveTab('CONTENT');
      return;
    }
    if (!excerpt.trim()) {
      toast.error('Vui lòng nhập đoạn tóm tắt (Sapo) cho bài viết!');
      setActiveTab('CONTENT');
      return;
    }

    let scheduledAtIso: string | null = null;
    if (targetStatus === 'SCHEDULED') {
      if (!scheduledLocal) {
        toast.error('Vui lòng chọn ngày giờ hẹn xuất bản!');
        setActiveTab('PUBLISH');
        return;
      }
      const parsed = new Date(scheduledLocal);
      if (Number.isNaN(parsed.getTime())) {
        toast.error('Thời gian hẹn giờ không hợp lệ!');
        setActiveTab('PUBLISH');
        return;
      }
      scheduledAtIso = parsed.toISOString();
    }

    setIsSubmitting(true);
    try {
      const saved = await newsService.saveArticle({
        id: editingArticle?.id,
        category_id: categoryId,
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        excerpt: excerpt.trim(),
        content,
        thumbnail_url: thumbnailUrl.trim(),
        cover_image_url: thumbnailUrl.trim(),
        image_alt: imageAlt.trim() || title.trim(),
        image_caption: imageCaption.trim() || null,
        author_name: authorName.trim() || 'Ban Biên Tập Schoolify',
        author_role: authorRole.trim() || 'Ban Biên Tập Giáo Dục',
        source_name: sourceName.trim() || null,
        tags,
        grade_levels: gradeLevels,
        meta_title: (metaTitle.trim() || title.trim()).slice(0, 70),
        meta_description: (metaDescription.trim() || excerpt.trim()).slice(0, 160),
        focus_keyword: focusKeyword.trim() || tags[0] || null,
        canonical_url: canonicalUrl.trim() || null,
        is_indexable: isIndexable,
        status: targetStatus,
        scheduled_at: scheduledAtIso,
        published_at:
          targetStatus === 'PUBLISHED'
            ? editingArticle?.published_at || new Date().toISOString()
            : editingArticle?.published_at || null,
        is_featured: isFeatured,
        is_pinned: isPinned,
        is_breaking: isBreaking,
        view_count: editingArticle?.view_count ?? 0,
        like_count: editingArticle?.like_count ?? 0,
        created_at: editingArticle?.created_at,
      });

      const actionMsg =
        targetStatus === 'DRAFT'
          ? 'Đã lưu bài viết vào Bản nháp!'
          : targetStatus === 'SCHEDULED'
          ? 'Đã lên lịch hẹn giờ xuất bản bài viết!'
          : 'Đã xuất bản bài viết công khai lên trang Tin Tức!';

      toast.success(actionMsg);
      onSaved(saved);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pr-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {editingArticle
                  ? 'Chỉnh Sửa Bài Viết & Cấu Hình Xuất Bản'
                  : 'Soạn Thảo Bài Viết Tin Tức Mới'}
              </h2>
              <p className="text-xs font-normal text-slate-500">
                Hỗ trợ tự động tạo Mục lục (H2/H3), công thức Toán học LaTeX và chấm điểm chuẩn SEO
              </p>
            </div>
          </div>

          {/* Điểm SEO nhanh trên Header */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <Badge
              className={cn(
                'font-bold text-xs px-2.5 py-1',
                seoChecks.score >= 80
                  ? 'bg-emerald-500 text-white'
                  : seoChecks.score >= 60
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              )}
            >
              Điểm SEO: {seoChecks.score}/100
            </Badge>
          </div>
        </div>
      }
      footer={
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-[#00B8DD]" />
              {liveMetrics.wordCount} từ (~{liveMetrics.readingTimeMinutes} phút đọc)
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-semibold">
              <ListOrdered className="w-3.5 h-3.5 text-[#00B8DD]" />
              {liveToc.length} mục lục tự động
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-xl text-xs font-bold cursor-pointer"
            >
              Đóng
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleSaveWithStatus('DRAFT')}
              className="rounded-xl text-xs font-bold gap-1.5 border-slate-300 dark:border-slate-700 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Nháp</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => {
                if (activeTab !== 'PUBLISH') {
                  setStatus('SCHEDULED');
                  setActiveTab('PUBLISH');
                  toast.info('Chọn thời điểm hẹn giờ đăng và nhấn Xác nhận Hẹn giờ!');
                } else {
                  handleSaveWithStatus('SCHEDULED');
                }
              }}
              className="rounded-xl text-xs font-bold gap-1.5 border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>
                {activeTab === 'PUBLISH' && status === 'SCHEDULED'
                  ? 'Xác Nhận Hẹn Giờ'
                  : 'Hẹn Giờ Xuất Bản'}
              </span>
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isSubmitting}
              onClick={() => handleSaveWithStatus('PUBLISHED')}
              className="rounded-xl text-xs font-bold gap-1.5 bg-[#00B8DD] hover:bg-[#007D99] text-white shadow-sm cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Đăng Bài Ngay</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* ── THANH CHUYỂN TAB ── */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('CONTENT')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
              activeTab === 'CONTENT'
                ? 'bg-[#00B8DD] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>1. Nội Dung &amp; Mục Lục Tự Động</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SEO')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
              activeTab === 'SEO'
                ? 'bg-[#00B8DD] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>2. Chuẩn SEO &amp; Google Preview ({seoChecks.score}đ)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PUBLISH')}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer',
              activeTab === 'PUBLISH'
                ? 'bg-[#00B8DD] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            )}
          >
            <CalendarClock className="w-3.5 h-3.5" />
            <span>3. Chế Độ Xuất Bản &amp; Hẹn Giờ</span>
          </button>
        </div>

        {/* =====================================================================
            TAB 1: SOẠN THẢO NỘI DUNG & MỤC LỤC TỰ ĐỘNG
        ===================================================================== */}
        {activeTab === 'CONTENT' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Khung nhập nội dung (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tiêu đề bài viết <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="VD: Phân tích cấu trúc đề thi Tốt nghiệp THPT 2026 môn Toán..."
                  className="text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Đường dẫn bài viết (Slug chuẩn SEO)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSlugManuallyEdited(false);
                        setSlug(slugify(title));
                      }}
                      className="text-[11px] font-semibold text-[#007D99] dark:text-[#00B8DD] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Tạo lại từ tiêu đề
                    </button>
                  </div>
                  <Input
                    value={slug}
                    onChange={(e) => {
                      setSlugManuallyEdited(true);
                      setSlug(slugify(e.target.value));
                    }}
                    placeholder="phan-tich-cau-truc-de-thi-thpt-2026"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Chuyên mục <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tóm tắt Sapo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Tóm tắt mở đầu (Sapo) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Tóm tắt ngắn gọn 2-3 câu hiển thị ở thẻ bài viết ngoài trang chủ và mở đầu bài đọc..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                />
              </div>

              {/* Trình soạn thảo Nội dung + Thanh công cụ */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertSnippet('\n## Tiêu đề mục lớn (H2)\n')}
                      title="Chèn Tiêu đề cấp 2 (Tự động vào Mục lục)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#00B8DD] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Heading2 className="w-3.5 h-3.5 text-[#00B8DD]" /> H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet('\n### Tiêu đề mục con (H3)\n')}
                      title="Chèn Tiêu đề cấp 3 (Tự động vào Mục lục)"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#00B8DD] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Heading3 className="w-3.5 h-3.5 text-[#00B8DD]" /> H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet(' **nội dung in đậm** ')}
                      title="Chữ in đậm"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#00B8DD] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet('\n- Ý liệt kê thứ nhất\n- Ý liệt kê thứ hai\n')}
                      title="Danh sách gạch đầu dòng"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#00B8DD] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        insertSnippet('\n> Ghi chú quan trọng dành cho thí sinh khi làm bài.\n')
                      }
                      title="Hộp trích dẫn nổi bật"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#00B8DD] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertSnippet(' $f(x) = \\frac{ax + b}{cx + d}$ ')}
                      title="Chèn công thức Toán LaTeX"
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-bold text-[#007D99] dark:text-[#00B8DD] hover:border-[#00B8DD] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Sigma className="w-3.5 h-3.5" /> Công thức LaTeX
                    </button>
                  </div>

                  {/* Nút chuyển đổi Soạn thảo / Xem trước */}
                  <button
                    type="button"
                    onClick={() => setPreviewMode((prev) => !prev)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-1.5 cursor-pointer',
                      previewMode
                        ? 'border-[#00B8DD] bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{previewMode ? 'Quay lại Soạn thảo' : 'Xem trước bài đọc'}</span>
                  </button>
                </div>

                {previewMode ? (
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[360px] overflow-y-auto">
                    <ArticleContentRenderer content={content} toc={liveToc} />
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Sử dụng ## cho tiêu đề mục lớn (H2), ### cho mục con (H3), và $...$ cho công thức Toán học..."
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 text-xs sm:text-sm font-mono leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                  />
                )}
              </div>
            </div>

            {/* Cột phải: Xem trước Mục lục tự động & Ảnh đại diện & Tác giả (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Khung Mục lục tự động trực tiếp */}
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/70 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <ListOrdered className="w-4 h-4 text-[#00B8DD]" />
                    Mục Lục Tự Động ({liveToc.length})
                  </span>
                  <span className="text-[11px] text-slate-500">Từ thẻ ## H2, ### H3</span>
                </div>

                {liveToc.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Chưa có mục lục. Hãy thêm dòng bắt đầu bằng <code>## Tiêu đề</code> để tự động tạo mục lục!
                  </p>
                ) : (
                  <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                    {liveToc.map((item, idx) => (
                      <div
                        key={item.id}
                        className={cn(
                          'text-xs py-1 px-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 truncate',
                          item.level === 3 && 'ml-4 text-[11px] text-slate-500'
                        )}
                      >
                        <span className="font-bold text-[#007D99] dark:text-[#00B8DD] mr-1.5">
                          #{idx + 1}
                        </span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Ảnh đại diện & Alt Text */}
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#00B8DD]" />
                  Ảnh bìa bài viết (URL)
                </label>

                {thumbnailUrl && (
                  <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100">
                    <img
                      src={thumbnailUrl}
                      alt={imageAlt || title || 'Preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="text-xs"
                />

                <div className="flex flex-wrap gap-1.5">
                  {PRESET_THUMBNAILS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setThumbnailUrl(preset.url)}
                      className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#00B8DD] hover:text-white transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Văn bản thay thế ảnh (Image Alt SEO)
                  </label>
                  <Input
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Mô tả ảnh cho Google Image..."
                    className="text-xs"
                  />
                </div>
              </Card>

              {/* Tác giả & Nguồn */}
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Tên tác giả / Ban biên tập
                  </label>
                  <Input
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="VD: Ban Khảo Thí Schoolify"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    Chức danh chuyên môn (E-E-A-T)
                  </label>
                  <Input
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="VD: Giáo viên Toán Chuyên"
                    className="text-xs"
                  />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: CẤU HÌNH CHUẨN SEO & GOOGLE SNIPPET PREVIEW
        ===================================================================== */}
        {activeTab === 'SEO' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Các trường cấu hình SEO & Tags (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Từ khóa trọng tâm (Focus Keyword)
                  </label>
                  <Input
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="VD: cấu trúc đề thi THPT 2026"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Canonical URL (Tùy chọn)
                  </label>
                  <Input
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder={`https://schoolify.edu.vn/news/${slug || 'bai-viet'}`}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Meta Title + Bộ đếm 70 ký tự */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tiêu đề SEO (Meta Title)
                  </label>
                  <span
                    className={cn(
                      'text-[11px] font-bold',
                      seoChecks.effectiveMetaTitle.length > 70
                        ? 'text-rose-600'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {seoChecks.effectiveMetaTitle.length}/70 ký tự
                  </span>
                </div>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || 'Mặc định lấy theo tiêu đề bài viết...'}
                  className="text-xs sm:text-sm"
                />
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      seoChecks.effectiveMetaTitle.length > 70
                        ? 'bg-rose-500'
                        : seoChecks.effectiveMetaTitle.length >= 35
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((seoChecks.effectiveMetaTitle.length / 70) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Meta Description + Bộ đếm 160 ký tự */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mô tả chuẩn SEO (Meta Description)
                  </label>
                  <span
                    className={cn(
                      'text-[11px] font-bold',
                      seoChecks.effectiveMetaDesc.length > 160
                        ? 'text-rose-600'
                        : 'text-emerald-600 dark:text-emerald-400'
                    )}
                  >
                    {seoChecks.effectiveMetaDesc.length}/160 ký tự
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={excerpt || 'Mô tả thu hút người đọc trên trang kết quả Google...'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
                />
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      seoChecks.effectiveMetaDesc.length > 165
                        ? 'bg-rose-500'
                        : seoChecks.effectiveMetaDesc.length >= 80
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    )}
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((seoChecks.effectiveMetaDesc.length / 160) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Quản lý Tags & Khối lớp */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#00B8DD]" />
                  Thẻ từ khóa (Tags) &amp; Phân loại Khối lớp
                </label>

                <div className="flex items-center gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(tagInput);
                      }
                    }}
                    placeholder="Nhập tag rồi nhấn Enter..."
                    className="text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(tagInput)}
                    className="rounded-xl text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Thêm Tag
                  </Button>
                </div>

                {/* Danh sách tag đã chọn */}
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] text-xs font-bold"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Gợi ý tag nhanh */}
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Gợi ý:</span>
                  {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleAddTag(sug)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 hover:bg-[#00B8DD] hover:text-white transition-colors cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>

                {/* Chọn khối lớp */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Khối lớp mục tiêu:
                    </span>
                    {[10, 11, 12].map((g) => {
                      const active = gradeLevels.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleGrade(g)}
                          className={cn(
                            'px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer',
                            active
                              ? 'bg-[#00B8DD] text-white border-[#00B8DD]'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                          )}
                        >
                          Khối {g}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Cho phép Google Index
                    </span>
                    <Switch
                      size="sm"
                      checked={isIndexable}
                      onCheckedChange={setIsIndexable}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cột phải: Google SERP Snippet Preview & Checklist SEO (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#00B8DD]" />
                    Google Search Preview (SERP)
                  </span>

                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setSerpDevice('desktop')}
                      className={cn(
                        'p-1.5 rounded-md text-xs cursor-pointer',
                        serpDevice === 'desktop'
                          ? 'bg-white dark:bg-slate-950 text-[#00B8DD] shadow-2xs'
                          : 'text-slate-500'
                      )}
                      title="Giao diện Desktop"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSerpDevice('mobile')}
                      className={cn(
                        'p-1.5 rounded-md text-xs cursor-pointer',
                        serpDevice === 'mobile'
                          ? 'bg-white dark:bg-slate-950 text-[#00B8DD] shadow-2xs'
                          : 'text-slate-500'
                      )}
                      title="Giao diện Mobile"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mô phỏng khung kết quả tìm kiếm Google */}
                <div
                  className={cn(
                    'p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 font-sans',
                    serpDevice === 'mobile' && 'max-w-[340px] mx-auto'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#00B8DD] text-white font-black text-xs flex items-center justify-center shrink-0">
                      S
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-none">
                        Schoolify Education
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        https://schoolify.edu.vn › news › {slug || 'duong-dan-bai-viet'}
                      </p>
                    </div>
                  </div>

                  <h4 className="text-base sm:text-lg font-semibold text-[#1a0dab] dark:text-[#8ab4f8] hover:underline line-clamp-2 leading-snug pt-0.5">
                    {seoChecks.effectiveMetaTitle ||
                      'Tiêu đề bài viết chuẩn SEO sẽ hiển thị tại đây'}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    <span className="text-slate-400 mr-1.5">
                      {new Date().toLocaleDateString('vi-VN')} —
                    </span>
                    {seoChecks.effectiveMetaDesc ||
                      'Mô tả ngắn gọn (Meta Description) của bài viết sẽ xuất hiện trên trang kết quả tìm kiếm Google để thu hút học sinh và giáo viên nhấp vào đọc.'}
                  </p>
                </div>
              </Card>

              {/* Danh sách kiểm tra chuẩn SEO */}
              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00B8DD]" />
                    Checklist Tối Ưu SEO ({seoChecks.score}/100)
                  </h4>
                </div>
                <div className="space-y-2">
                  {seoChecks.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      {item.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={cn(
                          item.ok
                            ? 'text-slate-700 dark:text-slate-200 font-medium'
                            : 'text-slate-500'
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: QUẢN TRỊ XUẤT BẢN, LƯU NHÁP & HẸN GIỜ ĐĂNG BÀI
        ===================================================================== */}
        {activeTab === 'PUBLISH' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cột trái: Chế độ xuất bản & Lịch hẹn giờ (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Chọn Chế Độ Xuất Bản Bài Viết
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    {
                      id: 'PUBLISHED',
                      title: 'Đăng Công Khai Ngay',
                      desc: 'Hiển thị lập tức trên /news và /news/[slug]',
                      icon: Send,
                    },
                    {
                      id: 'DRAFT',
                      title: 'Lưu Bản Nháp',
                      desc: 'Chỉ lưu trong CMS để biên tập viên sửa tiếp',
                      icon: Save,
                    },
                    {
                      id: 'SCHEDULED',
                      title: 'Hẹn Giờ Xuất Bản',
                      desc: 'Tự động lên sóng khi tới đúng ngày giờ hẹn',
                      icon: CalendarClock,
                    },
                  ] as const
                ).map((mode) => {
                  const Icon = mode.icon;
                  const selected = status === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setStatus(mode.id)}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all space-y-2 cursor-pointer',
                        selected
                          ? 'border-[#00B8DD] bg-[#00B8DD]/10 ring-1 ring-[#00B8DD]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      )}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {mode.title}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-snug">{mode.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Khung chọn thời điểm Hẹn giờ (khi chọn SCHEDULED hoặc đặt lịch trước) */}
              <Card className="rounded-2xl border-amber-300/70 dark:border-amber-800/70 bg-amber-50/50 dark:bg-amber-950/20 p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-amber-600" />
                    Thời Điểm Hẹn Giờ Xuất Bản Tự Động
                  </label>
                  <Badge className="bg-amber-500 text-white text-[10px] font-bold">
                    Auto-Publish
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Khi đặt trạng thái <strong>Hẹn giờ xuất bản</strong>, bài viết sẽ tự động chuyển sang công khai ngay khi đồng hồ hệ thống chạm mốc thời gian dưới đây:
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Input
                    type="datetime-local"
                    value={scheduledLocal}
                    onChange={(e) => {
                      setScheduledLocal(e.target.value);
                      setStatus('SCHEDULED');
                    }}
                    className="text-xs sm:text-sm font-bold bg-white dark:bg-slate-900"
                  />

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 1);
                        d.setHours(8, 0, 0, 0);
                        setScheduledLocal(toDatetimeLocalValue(d.toISOString()));
                        setStatus('SCHEDULED');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                    >
                      08:00 Sáng mai
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date();
                        d.setHours(20, 0, 0, 0);
                        if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
                        setScheduledLocal(toDatetimeLocalValue(d.toISOString()));
                        setStatus('SCHEDULED');
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                    >
                      20:00 Tối nay
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Cột phải: Tùy chọn Tiêu điểm, Ghim bài & Tin nóng (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Vị Trí Hiển Thị Ưu Tiên Trên Trang `/news`
              </h3>

              <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Tin Tiêu Điểm Nổi Bật (Featured Hero)
                    </p>
                    <p className="text-xs text-slate-500">
                      Hiển thị bài viết này ở khung Banner lớn nhất đầu trang `/news`.
                    </p>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                </div>

                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Pin className="w-4 h-4 text-[#00B8DD]" />
                      Ghim Đầu Danh Sách (Pinned)
                    </p>
                    <p className="text-xs text-slate-500">
                      Luôn ưu tiên xếp bài viết này lên vị trí đầu tiên của lưới tin tức.
                    </p>
                  </div>
                  <Switch checked={isPinned} onCheckedChange={setIsPinned} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500" />
                      Nhãn Tin Nóng Mùa Thi (Breaking News)
                    </p>
                    <p className="text-xs text-slate-500">
                      Gắn huy hiệu đỏ nổi bật cho các thông báo khẩn từ Bộ GD&amp;ĐT.
                    </p>
                  </div>
                  <Switch checked={isBreaking} onCheckedChange={setIsBreaking} />
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
