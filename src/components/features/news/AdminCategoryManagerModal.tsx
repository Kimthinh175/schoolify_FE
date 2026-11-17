'use client';

import * as React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  FolderKanban,
  Check,
  X,
  ArrowUpDown,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { NewsCategory } from '@/types';
import { newsService, slugify } from '@/services/news.service';

interface AdminCategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: NewsCategory[];
  onUpdated: () => void;
}

const PRESET_COLORS = [
  { label: 'Xanh Schoolify', value: '#00B8DD' },
  { label: 'Tím Indigo', value: '#6366F1' },
  { label: 'Xanh Ngọc Lục', value: '#10B981' },
  { label: 'Vàng Hổ Phách', value: '#F59E0B' },
  { label: 'Hồng Đào', value: '#EC4899' },
  { label: 'Xanh Dương', value: '#0EA5E9' },
];

export function AdminCategoryManagerModal({
  isOpen,
  onClose,
  categories,
  onUpdated,
}: AdminCategoryManagerModalProps) {
  const [editingCat, setEditingCat] = React.useState<NewsCategory | null>(null);
  const [name, setName] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState('#00B8DD');
  const [orderIndex, setOrderIndex] = React.useState('1');
  const [metaTitle, setMetaTitle] = React.useState('');
  const [metaDescription, setMetaDescription] = React.useState('');
  const [isActive, setIsActive] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setSlugManuallyEdited(false);
    setDescription('');
    setColor('#00B8DD');
    setOrderIndex(String(categories.length + 1));
    setMetaTitle('');
    setMetaDescription('');
    setIsActive(true);
  }, [categories.length]);

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleStartEdit = (cat: NewsCategory) => {
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setSlugManuallyEdited(true);
    setDescription(cat.description || '');
    setColor(cat.color || '#00B8DD');
    setOrderIndex(String(cat.order_index ?? 1));
    setMetaTitle(cat.meta_title || '');
    setMetaDescription(cat.meta_description || '');
    setIsActive(cat.is_active ?? true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên chuyên mục!');
      return;
    }

    setIsSaving(true);
    try {
      await newsService.saveCategory({
        id: editingCat?.id,
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        color,
        order_index: Math.max(1, Number(orderIndex) || 1),
        is_active: isActive,
        is_featured: true,
        meta_title: metaTitle.trim() || `${name.trim()} | Schoolify`,
        meta_description: metaDescription.trim() || description.trim(),
        created_at: editingCat?.created_at,
      });

      toast.success(
        editingCat
          ? `Đã cập nhật chuyên mục "${name.trim()}"!`
          : `Đã thêm chuyên mục "${name.trim()}" mới!`
      );
      resetForm();
      onUpdated();
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (cat: NewsCategory, nextActive: boolean) => {
    await newsService.toggleCategoryFlags(cat.id, { is_active: nextActive });
    toast.success(
      nextActive
        ? `Đã bật hiển thị chuyên mục "${cat.name}" trên trang công khai.`
        : `Đã tạm ẩn chuyên mục "${cat.name}".`
    );
    onUpdated();
  };

  const handleDelete = async (cat: NewsCategory) => {
    const res = await newsService.deleteCategory(cat.id);
    if (!res.ok) {
      toast.error(res.message || 'Không thể xoá chuyên mục này.');
      return;
    }
    toast.success(`Đã xoá chuyên mục "${cat.name}".`);
    if (editingCat?.id === cat.id) resetForm();
    onUpdated();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00B8DD]/15 text-[#007D99] dark:text-[#00B8DD] flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Quản Lý Chuyên Mục Tin Tức
            </h2>
            <p className="text-xs font-normal text-slate-500">
              Cấu hình danh mục phân loại, thứ tự hiển thị trên thanh tab và thẻ SEO chuyên mục
            </p>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* CỘT TRÁI: FORM THÊM / SỬA CHUYÊN MỤC (5 cols) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 space-y-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {editingCat ? `Chỉnh sửa: ${editingCat.name}` : 'Thêm Chuyên Mục Mới'}
            </h3>
            {editingCat && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Huỷ sửa
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Tên chuyên mục <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Thi Tốt Nghiệp THPT"
              className="text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Đường dẫn chuẩn SEO (Slug)
              </label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="thi-tot-nghiep-thpt"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Thứ tự Tab
              </label>
              <Input
                type="number"
                min={1}
                value={orderIndex}
                onChange={(e) => setOrderIndex(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Màu sắc nhận diện */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Màu sắc Badge chuyên mục
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.label}
                  onClick={() => setColor(preset.value)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform cursor-pointer',
                    color === preset.value
                      ? 'scale-110 border-slate-900 dark:border-white shadow-sm'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  )}
                  style={{ backgroundColor: preset.value }}
                >
                  {color === preset.value && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mô tả chuyên mục
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn hiển thị ở phần đầu trang chuyên mục..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00B8DD]"
            />
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#00B8DD]" />
              Tiêu đề SEO (Meta Title)
            </label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Mặc định lấy theo tên chuyên mục..."
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Hiển thị công khai trên `/news`
            </span>
            <Switch checked={isActive} onCheckedChange={setIsActive} size="sm" />
          </div>

          <Button
            type="submit"
            disabled={isSaving}
            className="w-full bg-[#00B8DD] hover:bg-[#007D99] text-white font-bold rounded-xl text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {editingCat ? 'Lưu Cập Nhật Chuyên Mục' : 'Tạo Chuyên Mục Mới'}
          </Button>
        </form>

        {/* CỘT PHẢI: DANH SÁCH CHUYÊN MỤC HIỆN CÓ (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00B8DD]" />
              Danh sách {categories.length} chuyên mục (Sắp xếp theo thứ tự Tab)
            </span>
          </div>

          <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={cn(
                  'p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900',
                  editingCat?.id === cat.id
                    ? 'border-[#00B8DD] ring-1 ring-[#00B8DD]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || '#00B8DD' }}
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono px-2 py-0 border-slate-200 dark:border-slate-700 text-slate-500"
                    >
                      /{cat.slug}
                    </Badge>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      {cat.articles_count ?? 0} bài viết
                    </Badge>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="flex items-center gap-1.5" title="Bật/tắt hiển thị chuyên mục">
                    <span className="text-[11px] text-slate-500">
                      {cat.is_active ? 'Đang hiện' : 'Đang ẩn'}
                    </span>
                    <Switch
                      size="sm"
                      checked={cat.is_active}
                      onCheckedChange={(val) => handleToggleActive(cat, val)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartEdit(cat)}
                    className="h-8 px-2.5 rounded-lg text-xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(cat)}
                    className="h-8 px-2.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200 dark:border-slate-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
