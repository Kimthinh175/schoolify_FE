'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  QUESTION_TYPE_GUIDES,
  VALIDATION_RULES_SUMMARY,
} from '@/constants/import-guidelines';
import {
  downloadExcelTemplate,
  downloadWordTemplate,
} from '@/services/parsers/template-generator.service';

export function ImportGuidelineModal({ triggerText = 'Hướng dẫn & File mẫu' }: { triggerText?: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'types' | 'word' | 'excel' | 'rules'>('types');

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-primary/30 text-primary bg-white hover:bg-primary/5 gap-1.5 font-medium text-xs shadow-xs shrink-0 whitespace-nowrap"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        {triggerText}
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="4xl"
        title={
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Quy Chuẩn Soạn Đề & Nguyên Tắc Import (Word & Excel)
          </div>
        }
        description="Tương thích 100% chuẩn THPTQG 2025, ĐGNL ĐHQG và chuẩn EdTech quốc tế."
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={downloadExcelTemplate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs shadow-xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Tải mẫu Excel (.xlsx)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadWordTemplate}
                className="border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100 gap-1.5 text-xs shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                Tải mẫu Word (.docx)
              </Button>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="text-xs border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              Đóng
            </Button>
          </div>
        }
      >
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Thanh Tab chuyển đổi */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('types')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'types'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              9 Loại câu hỏi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('word')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'word'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Quy ước Word (.docx)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'excel'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cột bảng Excel (.xlsx)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'rules'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nguyên tắc chấm điểm
            </button>
          </div>

          {/* TAB 1: 9 Loại câu hỏi */}
          {activeTab === 'types' && (
            <div className="grid grid-cols-1 gap-3">
              {QUESTION_TYPE_GUIDES.map((item) => (
                <div
                  key={item.type}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {item.name}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200 font-medium">
                        {item.badge}
                      </Badge>
                    </div>
                    <code className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded font-semibold">
                      {item.type}
                    </code>
                  </div>
                  <p className="text-xs text-slate-600">{item.description}</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap">
                    {item.wordSyntax}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Quy ước Word */}
          {activeTab === 'word' && (
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-sky-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  3 Cách Đánh Dấu Đáp Án Đúng Linh Hoạt
                </h4>
                <p>Hệ thống tự động phát hiện đáp án đúng nếu thỏa mãn 1 trong 3 dấu hiệu sau:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
                  <li>
                    <strong className="text-slate-900">Cách 1 (Gạch chân):</strong> Gạch chân chữ cái hoặc phương án: <span className="underline font-bold text-slate-900">A.</span> hoặc <span className="underline font-bold text-slate-900">A</span>.
                  </li>
                  <li>
                    <strong className="text-slate-900">Cách 2 (Màu đỏ):</strong> Chữ cái phương án được tô màu đỏ (<span className="text-red-600 font-bold">A.</span>).
                  </li>
                  <li>
                    <strong className="text-slate-900">Cách 3 (Dấu hoa thị):</strong> Đặt dấu hoa thị trước đáp án (<code className="text-amber-700 font-bold bg-amber-50 px-1 rounded">*A. Phương án đúng</code>).
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
                <h4 className="font-bold text-sm text-amber-700">Gắn Nhãn Mức Độ Nhận Thức (Bloom)</h4>
                <p>
                  Đặt tag ngay sau tiêu đề câu: <code className="text-primary font-bold bg-primary/10 px-1 rounded">[NB]</code> (Nhận biết), <code className="text-primary font-bold bg-primary/10 px-1 rounded">[TH]</code> (Thông hiểu), <code className="text-primary font-bold bg-primary/10 px-1 rounded">[VD]</code> (Vận dụng), <code className="text-primary font-bold bg-primary/10 px-1 rounded">[VDC]</code> (Vận dụng cao).
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Cột bảng Excel */}
          {activeTab === 'excel' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold text-[11px]">
                    <th className="p-3">Tên Cột</th>
                    <th className="p-3">Bắt buộc</th>
                    <th className="p-3">Mô tả & Cú pháp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 text-slate-900 font-bold">LoaiCauHoi</td>
                    <td className="p-3 text-emerald-600 font-semibold">Có</td>
                    <td className="p-3 text-slate-700">TN_1, TN_NHIEU, DUNG_SAI, DIEN_SO, TU_LUAN, NOI_CAP, SAP_XEP, DUC_LO</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-900 font-bold">Chuong</td>
                    <td className="p-3 text-slate-400">Tùy chọn</td>
                    <td className="p-3 text-slate-700">Tên chuyên đề (dùng để sinh ma trận đề thi)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-900 font-bold">MucDo</td>
                    <td className="p-3 text-slate-400">Tùy chọn</td>
                    <td className="p-3 text-slate-700">NB, TH, VD, VDC (mặc định là TH)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-900 font-bold">NoiDung</td>
                    <td className="p-3 text-emerald-600 font-semibold">Có</td>
                    <td className="p-3 text-slate-700">Nội dung câu hỏi (chấp nhận KaTeX $...$)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-900 font-bold">DapAnA - D</td>
                    <td className="p-3 text-slate-400">Tùy loại</td>
                    <td className="p-3 text-slate-700">Các phương án lựa chọn</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-900 font-bold">DapAnDung</td>
                    <td className="p-3 text-emerald-600 font-semibold">Có</td>
                    <td className="p-3 text-slate-700">A hoặc A, C hoặc Đ, S, Đ, S hoặc 3-1-4-2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: Nguyên tắc chấm điểm */}
          {activeTab === 'rules' && (
            <div className="space-y-3 text-xs text-slate-700">
              {VALIDATION_RULES_SUMMARY.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-1.5"
                >
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    {rule.title}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-xs">{rule.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
