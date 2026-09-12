'use client';

import * as React from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Table2, Trash2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LessonMaterial, MaterialType } from '@/types';

const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

const EXT_TO_TYPE: Record<string, MaterialType> = {
  png: 'IMG', jpg: 'IMG', jpeg: 'IMG', webp: 'IMG', gif: 'IMG',
  doc: 'DOCX', docx: 'DOCX',
  xls: 'EXCEL', xlsx: 'EXCEL',
  pdf: 'PDF',
};

const TYPE_META: Record<MaterialType, { label: string; icon: React.ReactNode; className: string }> = {
  IMG: { label: 'Hình ảnh', icon: <ImageIcon className="w-4 h-4" />, className: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300' },
  DOCX: { label: 'Word', icon: <FileText className="w-4 h-4" />, className: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300' },
  EXCEL: { label: 'Excel', icon: <Table2 className="w-4 h-4" />, className: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300' },
  PDF: { label: 'PDF', icon: <FileText className="w-4 h-4" />, className: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-300' },
};

/** Khu vực upload tài liệu bài học (LessonMaterial: IMG / DOCX / EXCEL / PDF) */
export function LessonMaterialUploader({
  lessonId,
  materials,
  onChange,
}: {
  lessonId: string;
  materials: LessonMaterial[];
  onChange: (materials: LessonMaterial[]) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: LessonMaterial[] = [];
    const invalid: string[] = [];
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const type = EXT_TO_TYPE[ext];
      if (!type) {
        invalid.push(file.name);
        return;
      }
      next.push({
        id: makeId('mat'),
        lesson_id: lessonId,
        title: file.name,
        file_url: URL.createObjectURL(file),
        file_type: type,
        file_size_bytes: file.size,
      });
    });
    setError(
      invalid.length ? `Định dạng không hỗ trợ: ${invalid.join(', ')} — chỉ nhận IMG, DOCX, EXCEL.` : null
    );
    if (next.length) onChange([...materials, ...next]);
  };

  const remove = (id: string) => onChange(materials.filter((m) => m.id !== id));

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.webp,.gif,.doc,.docx,.xls,.xlsx,.pdf"
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'w-full rounded-2xl border-2 border-dashed px-4 py-6 flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer',
          isDragging
            ? 'border-[#00B8DD] bg-[#E6F8FC] dark:bg-[#00B8DD]/10'
            : 'border-slate-200 hover:border-[#00B8DD]/60 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50'
        )}
      >
        <div className="h-10 w-10 rounded-xl bg-[#E6F8FC] text-[#007D99] dark:bg-[#00B8DD]/20 dark:text-[#00B8DD] flex items-center justify-center">
          <UploadCloud className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          Kéo thả tài liệu vào đây hoặc <span className="text-[#007D99] dark:text-[#00B8DD]">chọn file</span>
        </p>
        <p className="text-[11px] text-slate-400">Hỗ trợ Ảnh (IMG), Word (DOCX), Excel (XLSX), PDF</p>
      </button>

      {error && <p className="text-xs font-medium text-rose-500">{error}</p>}

      {materials.length > 0 && (
        <ul className="space-y-2">
          {materials.map((m) => {
            const meta = TYPE_META[m.file_type];
            return (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-2.5"
              >
                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center shrink-0', meta.className)}>
                  {meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{m.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {meta.label}
                    {m.file_size_bytes ? ` • ${formatSize(m.file_size_bytes)}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  aria-label={`Xoá tài liệu ${m.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {materials.length === 0 && (
        <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Paperclip className="w-3.5 h-3.5" /> Chưa có tài liệu đính kèm cho bài học này.
        </p>
      )}
    </div>
  );
}
