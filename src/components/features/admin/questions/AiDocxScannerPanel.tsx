'use client';

import * as React from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle2,
  Layers,
  Cpu,
  Sliders,
  RefreshCw,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { parseWordQuestions } from '@/services/parsers/word-parser';
import { Question } from '@/types/exam';
import { toast } from 'sonner';

export interface KnowledgeTopicItem {
  topicName: string;
  chapterId: number;
  weightPercent: number;
  vectorConfidence: number;
  sampleKeywords: string[];
}

export interface KnowledgeScopeReport {
  detectedSubjectSlug: string;
  detectedSubjectName: string;
  detectedGrade: number;
  extractedSeedQuestionCount: number;
  matchedBankQuestionCount: number;
  detectedTopics: KnowledgeTopicItem[];
  sourceBloomDistribution: {
    NHAN_BIET: number;
    THONG_HIEU: number;
    VAN_DUNG: number;
    VAN_DUNG_CAO: number;
  };
  targetBloomDistribution: {
    NHAN_BIET: number;
    THONG_HIEU: number;
    VAN_DUNG: number;
    VAN_DUNG_CAO: number;
  };
  scopeSummary: string;
}

export interface ParsedQuestionItem extends Question {
  hasError?: boolean;
  errorReason?: string;
  originalIndex: number;
  isFromDocxSeed?: boolean;
  generationMethod?: string;
  topic?: string;
}

interface AiDocxScannerPanelProps {
  onGeneratedComplete: (
    questions: ParsedQuestionItem[],
    scopeReport: KnowledgeScopeReport,
  ) => void;
}

const SAMPLE_DOCX_EXAMS: Array<{
  id: string;
  label: string;
  fileName: string;
  subject: string;
  rawText: string;
}> = [
  {
    id: 'toan-12',
    label: 'Đề mẫu Toán 12 (Hàm số & Tích phân)',
    fileName: 'De_Thi_Thu_Toan_12_Ham_So_Tich_Phan.docx',
    subject: 'toan-hoc',
    rawText: `Câu 1: [NB] Cho hàm số y = x^3 - 3x^2 + 2. Tìm khoảng nghịch biến của hàm số và cực trị của đồ thị hàm số.
*A. (0; 2)
B. (-∞; 0)
C. (2; +∞)
D. (-1; 1)
Lời giải: Tính đạo hàm y' = 3x^2 - 6x = 0 <=> x = 0 hoặc x = 2. Hàm số nghịch biến trên (0; 2).
Câu 2: [TH] Tìm phương trình đường tiệm cận ngang và tiệm cận đứng của đồ thị hàm số y = (2x - 1)/(x + 1).
*A. y = 2 và x = -1
B. y = -1 và x = 2
C. y = 1 và x = -1
D. y = 2 và x = 1
Câu 3: [VD] Tính diện tích hình phẳng giới hạn bởi đồ thị hàm số và tích phân xác định trên đoạn [0; 4].
A. 4
*B. 8
C. 12
D. 16`,
  },
  {
    id: 'vat-ly-12',
    label: 'Đề mẫu Vật Lý 12 (Khí lý tưởng & Hạt nhân)',
    fileName: 'De_Kiem_Tra_Vat_Ly_12_Khi_Ly_Tuong_Hat_Nhan.docx',
    subject: 'vat-ly',
    rawText: `Câu 1: [NB] Trong quá trình đẳng nhiệt của một lượng khí lý tưởng xác định, áp suất tỉ lệ nghịch với đại lượng nào?
*A. Thể tích V của khối khí
B. Nhiệt độ tuyệt đối T
C. Nội năng của khí
D. Khối lượng phân tử
Câu 2: [VD] Hạt nhân nguyên tử có hiện tượng phóng xạ với chu kỳ bán rã và năng lượng liên kết riêng. Khi tính độ hụt khối của hạt nhân, công thức nào là đúng?
*A. Δm = Z.mp + (A - Z).mn - mX
B. Δm = Z.mp + A.mn - mX
C. Δm = mX - (Z.mp + N.mn)
D. Δm = A.mp - Z.mn`,
  },
  {
    id: 'sinh-hoc-12',
    label: 'Đề mẫu Sinh Học 12 (Di truyền & Quang hợp)',
    fileName: 'De_Thi_Thu_Sinh_Hoc_12_Di_Truyen_Phan_Tu.docx',
    subject: 'sinh-hoc',
    rawText: `Câu 1: [NB] Trong tế bào thực vật, quá trình quang hợp và chuyển hóa năng lượng ánh sáng diễn ra tại bào quan nào?
*A. Bào quan lục lạp
B. Ti thể
C. Bộ máy Golgi
D. Lưới nội chất
Câu 2: [TH] Trong cơ chế di truyền cấp độ phân tử, quá trình phiên mã tổng hợp phân tử ARN diễn ra dựa trên mạch nào của gen ADN?
*A. Mạch khuôn có chiều 3' -> 5'
B. Mạch bổ sung có chiều 5' -> 3'
C. Cả hai mạch của phân tử ADN
D. Mạch polipeptit`,
  },
];

const COUNT_PRESETS = [5, 10, 15, 20, 30, 40, 50];

export function AiDocxScannerPanel({ onGeneratedComplete }: AiDocxScannerPanelProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [selectedSampleId, setSelectedSampleId] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [targetCount, setTargetCount] = React.useState<number>(15);
  const [useCustomBloom, setUseCustomBloom] = React.useState(false);
  const [bloomRatio, setBloomRatio] = React.useState({
    NHAN_BIET: 30,
    THONG_HIEU: 40,
    VAN_DUNG: 20,
    VAN_DUNG_CAO: 10,
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleSelectFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx') {
      toast.error('Tính năng AI Quét Đề chỉ nhận định dạng Microsoft Word (.docx)!');
      return;
    }
    setSelectedFile(file);
    setSelectedSampleId(null);
    toast.success(`Đã nạp file đề thi: ${file.name}`);
  };

  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    setSelectedFile(null);
    const sample = SAMPLE_DOCX_EXAMS.find((s) => s.id === sampleId);
    if (sample) {
      toast.info(`Đã nạp đề mẫu: ${sample.fileName}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleRunAiScanAndGenerate = async () => {
    if (!selectedFile && !selectedSampleId) {
      toast.error('Vui lòng tải lên 1 file đề thi (.docx) hoặc chọn đề mẫu để AI quét phạm vi kiến thức!');
      return;
    }

    setIsScanning(true);
    try {
      let seedQuestions: any[] = [];
      let fileName = 'De_Thi_Goc.docx';
      let rawText = '';

      if (selectedFile) {
        fileName = selectedFile.name;
        // Tiền xử lý bóc tách câu hỏi gốc từ file .docx trên client bằng mammoth
        try {
          const parsed = await parseWordQuestions(selectedFile);
          seedQuestions = parsed.allParsed;
        } catch {
          // Nếu file docx chỉ chứa văn bản thuần túy, backend sẽ tự đọc buffer
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('fileName', fileName);
        formData.append('targetCount', String(targetCount));
        if (useCustomBloom) {
          formData.append('bloomRatio', JSON.stringify(bloomRatio));
        }

        const res = await fetch('/api/v1/agent/docx-scan-generate', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Không thể phân tích file .docx');
        }

        toast.success(json.message);
        onGeneratedComplete(json.data.generatedQuestions, json.data.knowledgeScope);
        return;
      }

      // Nếu Admin chọn 1 trong các đề mẫu .docx có sẵn để test nhanh
      const sample = SAMPLE_DOCX_EXAMS.find((s) => s.id === selectedSampleId)!;
      fileName = sample.fileName;
      rawText = sample.rawText;

      const res = await fetch('/api/v1/agent/docx-scan-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName,
          rawText,
          targetCount,
          subject: sample.subject,
          seedQuestions,
          ...(useCustomBloom ? { bloomRatio } : {}),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Lỗi khi AI quét phạm vi kiến thức');
      }

      toast.success(json.message);
      onGeneratedComplete(json.data.generatedQuestions, json.data.knowledgeScope);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Có lỗi xảy ra khi AI quét đề .docx');
    } finally {
      setIsScanning(false);
    }
  };

  const activeSample = SAMPLE_DOCX_EXAMS.find((s) => s.id === selectedSampleId);

  return (
    <div className="space-y-6">
      {/* Khối 1: Kéo thả file .docx hoặc chọn Đề Mẫu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cột trái: Dropzone tải file .docx (7 cột) */}
        <div className="lg:col-span-7 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#00B8DD] bg-[#00B8DD]/10 scale-[0.99]'
                : selectedFile || activeSample
                  ? 'border-emerald-500/70 bg-emerald-50/40 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-[#00B8DD]/60 bg-white dark:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleSelectFile(e.target.files[0]);
                }
              }}
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs ${
                  selectedFile || activeSample
                    ? 'bg-emerald-500 text-white'
                    : 'bg-[#00B8DD]/15 text-[#00B8DD]'
                }`}
              >
                {selectedFile || activeSample ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              {selectedFile ? (
                <div className="space-y-1">
                  <Badge className="bg-emerald-600 text-white text-xs">Đã nạp file Word (.docx)</Badge>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white break-words">
                    {selectedFile.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Dung lượng: {(selectedFile.size / 1024).toFixed(1)} KB — Nhấn để đổi file khác
                  </p>
                </div>
              ) : activeSample ? (
                <div className="space-y-1">
                  <Badge className="bg-[#00B8DD] text-white text-xs">Đang dùng Đề Mẫu (.docx)</Badge>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white break-words">
                    {activeSample.fileName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeSample.label} — Nhấn vào khung này nếu muốn tải file từ máy tính
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    Đưa đề thi định dạng <span className="text-[#00B8DD]">.docx</span> vào để AI Scan phạm vi kiến thức
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                    AI sẽ tự động đọc hiểu chuyên đề, công thức toán học, mức độ tư duy Bloom của đề gốc và sinh ra số lượng câu hỏi mới theo đúng mong muốn của bạn.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách Đề mẫu thử nhanh (Tuân thủ flex-wrap cấm scroll ngang) */}
          <Card className="p-4 bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Chưa có sẵn file .docx? Chọn nhanh Đề Thi Mẫu dưới đây để test AI Scan:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {SAMPLE_DOCX_EXAMS.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border text-left ${
                      isSelected
                        ? 'bg-[#00B8DD] text-white border-[#00B8DD] shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#00B8DD]'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="break-words">{sample.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Cột phải: Cấu hình Số lượng câu hỏi cần sinh & Tỉ lệ Bloom (5 cột) */}
        <Card className="lg:col-span-5 p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#00B8DD]" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Cấu Hình AI Sinh Câu Hỏi Theo Đề
                </h3>
              </div>
              <Badge variant="outline" className="text-[11px] border-[#00B8DD]/40 text-[#00B8DD]">
                Vector + Agentic
              </Badge>
            </div>

            {/* Chọn số lượng câu hỏi mong muốn */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Số lượng câu hỏi muốn AI sinh ra:
                </label>
                <span className="text-sm font-black text-[#00B8DD]">{targetCount} câu hỏi</span>
              </div>

              {/* Các nút chọn nhanh số lượng (flex-wrap chống cuộn ngang) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {COUNT_PRESETS.map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setTargetCount(cnt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      targetCount === cnt
                        ? 'bg-[#00B8DD] text-white border-[#00B8DD] shadow-2xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#00B8DD]/50'
                    }`}
                  >
                    {cnt} câu
                  </button>
                ))}
              </div>

              {/* Ô nhập số lượng tùy ý */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                  Hoặc nhập số lượng bất kỳ (1 - 100):
                </span>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={targetCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setTargetCount(Math.min(100, Math.max(1, val)));
                  }}
                  className="w-24 h-8 text-xs font-bold text-center"
                />
              </div>
            </div>

            {/* Tùy chọn giữ nguyên phân bố Bloom của đề gốc hoặc tùy chỉnh */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Ma trận độ khó nhận thức Bloom:
                </span>
                <button
                  type="button"
                  onClick={() => setUseCustomBloom(!useCustomBloom)}
                  className="text-xs font-semibold text-[#00B8DD] hover:underline"
                >
                  {useCustomBloom ? 'Dùng tự động theo đề gốc' : 'Tùy chỉnh tỉ lệ %'}
                </button>
              </div>

              {!useCustomBloom ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ✨ <strong>Chế độ Bám sát Đề Gốc (Khuyên dùng):</strong> AI sẽ tự động quét tỉ lệ Nhận biết / Thông hiểu / Vận dụng / Vận dụng cao của đề <code className="text-[#00B8DD] font-semibold">.docx</code> để nhân bản các câu hỏi có độ khó tương đương.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-600">Nhận biết (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={bloomRatio.NHAN_BIET}
                      onChange={(e) =>
                        setBloomRatio({ ...bloomRatio, NHAN_BIET: Number(e.target.value) || 0 })
                      }
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-sky-600">Thông hiểu (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={bloomRatio.THONG_HIEU}
                      onChange={(e) =>
                        setBloomRatio({ ...bloomRatio, THONG_HIEU: Number(e.target.value) || 0 })
                      }
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-amber-600">Vận dụng (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={bloomRatio.VAN_DUNG}
                      onChange={(e) =>
                        setBloomRatio({ ...bloomRatio, VAN_DUNG: Number(e.target.value) || 0 })
                      }
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-purple-600">Vận dụng cao (%)</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={bloomRatio.VAN_DUNG_CAO}
                      onChange={(e) =>
                        setBloomRatio({ ...bloomRatio, VAN_DUNG_CAO: Number(e.target.value) || 0 })
                      }
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nút Kích Hoạt AI Scan & Sinh Câu Hỏi */}
          <Button
            type="button"
            disabled={isScanning}
            onClick={handleRunAiScanAndGenerate}
            className="w-full min-h-[44px] bg-[#00B8DD] hover:bg-[#00B8DD]/90 text-white font-bold text-xs sm:text-sm gap-2 shadow-sm rounded-xl"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI đang quét phạm vi kiến thức & sinh {targetCount} câu hỏi...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>AI Quét Đề .DOCX & Sinh Ngay {targetCount} Câu Hỏi</span>
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
