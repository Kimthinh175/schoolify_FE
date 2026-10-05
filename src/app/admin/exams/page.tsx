'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import {
  FileCheck2,
  Wand2,
  Search,
  Clock,
  RotateCcw,
  Eye,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

interface MockExamItem {
  id: string;
  title: string;
  subject: string;
  grade_level: string;
  total_questions: number;
  duration_minutes: number;
  pass_score: number;
  variant_count: number;
  is_published: boolean;
  created_at: string;
}

const INITIAL_EXAMS: MockExamItem[] = [
  {
    id: 'exam_1',
    title: 'Đề Khảo Sát Năng Lực Toán 12 - Chuẩn ĐHQG 2026',
    subject: 'Toán học',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    pass_score: 5.0,
    variant_count: 4,
    is_published: true,
    created_at: '2026-03-01',
  },
  {
    id: 'exam_2',
    title: 'Đề Thi Thử Tốt Nghiệp THPT Môn Vật Lí (4 Mã Đề)',
    subject: 'Vật lí',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    pass_score: 5.0,
    variant_count: 4,
    is_published: true,
    created_at: '2026-03-05',
  },
  {
    id: 'exam_3',
    title: 'Đề Đánh Giá Tư Duy Toán Học Định Lượng',
    subject: 'Toán học',
    grade_level: '12',
    total_questions: 30,
    duration_minutes: 40,
    pass_score: 6.0,
    variant_count: 2,
    is_published: false,
    created_at: '2026-03-10',
  },
  {
    id: 'exam_4',
    title: 'Đề Khảo Sát Tiếng Anh THPTQG 2026 - Đọc Hiểu Chuyên Sâu',
    subject: 'Tiếng Anh',
    grade_level: '12',
    total_questions: 50,
    duration_minutes: 60,
    pass_score: 5.0,
    variant_count: 4,
    is_published: true,
    created_at: '2026-03-12',
  },
  {
    id: 'exam_5',
    title: 'Đề Thi Thử Hóa Học Hữu Cơ & Vô Cơ Toàn Diện',
    subject: 'Hóa học',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    pass_score: 5.0,
    variant_count: 4,
    is_published: true,
    created_at: '2026-03-14',
  },
  {
    id: 'exam_6',
    title: 'Đề Thi Học Kì 2 Môn Sinh Học Lớp 11',
    subject: 'Sinh học',
    grade_level: '11',
    total_questions: 28,
    duration_minutes: 45,
    pass_score: 5.0,
    variant_count: 2,
    is_published: true,
    created_at: '2026-03-15',
  },
  {
    id: 'exam_7',
    title: 'Đề Khảo Sát Lịch Sử Thế Giới & Việt Nam Hiện Đại',
    subject: 'Lịch sử',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    pass_score: 5.0,
    variant_count: 4,
    is_published: false,
    created_at: '2026-03-18',
  },
  {
    id: 'exam_8',
    title: 'Đề Kiểm Tra Giữa Kì 2 Địa Lí Tự Nhiên & Kinh Tế',
    subject: 'Địa lí',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    pass_score: 5.0,
    variant_count: 2,
    is_published: true,
    created_at: '2026-03-20',
  },
  {
    id: 'exam_9',
    title: 'Đề Thi Thử Toán Học Chuyên Sâu - ĐGNL ĐHQG Hà Nội',
    subject: 'Toán học',
    grade_level: 'ĐGNL',
    total_questions: 50,
    duration_minutes: 75,
    pass_score: 6.0,
    variant_count: 8,
    is_published: true,
    created_at: '2026-03-22',
  },
  {
    id: 'exam_10',
    title: 'Đề Khảo Sát Năng Lực Tiếng Anh THCS - Chuyển Cấp Lớp 10',
    subject: 'Tiếng Anh',
    grade_level: '10',
    total_questions: 40,
    duration_minutes: 60,
    pass_score: 5.0,
    variant_count: 2,
    is_published: true,
    created_at: '2026-03-25',
  },
  {
    id: 'exam_11',
    title: 'Đề Kiểm Tra Định Kì Vật Lí Sóng Ánh Sáng & Lượng Tử',
    subject: 'Vật lí',
    grade_level: '12',
    total_questions: 30,
    duration_minutes: 45,
    pass_score: 5.0,
    variant_count: 4,
    is_published: false,
    created_at: '2026-03-27',
  },
  {
    id: 'exam_12',
    title: 'Đề Khảo Sát Tổng Hợp KHTN - Thi Thử Tốt Nghiệp 2026',
    subject: 'Hóa học',
    grade_level: '12',
    total_questions: 40,
    duration_minutes: 50,
    pass_score: 5.0,
    variant_count: 4,
    is_published: true,
    created_at: '2026-03-29',
  },
];

const ITEMS_PER_PAGE = 10;

// Hàm sinh bảng ma trận đáp án mẫu cho từng mã đề hoán vị
function generateAnswerMatrix(variantCode: string, totalQuestions: number) {
  const letters = ['A', 'B', 'C', 'D'];
  const offset = parseInt(variantCode, 10) || 101;
  return Array.from({ length: totalQuestions }, (_, idx) => {
    const choice = letters[(idx * 3 + offset + Math.floor(idx / 4)) % 4];
    return {
      qNum: idx + 1,
      answer: choice,
    };
  });
}

export default function AdminExamsPage() {
  const [exams, setExams] = React.useState<MockExamItem[]>(INITIAL_EXAMS);
  const [search, setSearch] = React.useState('');
  const [selectedSubject, setSelectedSubject] = React.useState('ALL');
  const [selectedGrade, setSelectedGrade] = React.useState('ALL');
  const [selectedStatus, setSelectedStatus] = React.useState('ALL');
  const [selectedVariant, setSelectedVariant] = React.useState('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);

  // State Modal Xem Chi Tiết
  const [selectedExamDetail, setSelectedExamDetail] = React.useState<MockExamItem | null>(null);
  const [activeVariantCode, setActiveVariantCode] = React.useState<string>('101');

  // Reset trang về 1 khi lọc
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleSubjectChange = (val: string) => {
    setSelectedSubject(val);
    setCurrentPage(1);
  };

  const handleGradeChange = (val: string) => {
    setSelectedGrade(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleVariantChange = (val: string) => {
    setSelectedVariant(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSubject('ALL');
    setSelectedGrade('ALL');
    setSelectedStatus('ALL');
    setSelectedVariant('ALL');
    setCurrentPage(1);
  };

  const handleTogglePublish = (examId: string) => {
    setExams((prev) =>
      prev.map((e) =>
        e.id === examId ? { ...e, is_published: !e.is_published } : e
      )
    );
    if (selectedExamDetail && selectedExamDetail.id === examId) {
      setSelectedExamDetail((prev) =>
        prev ? { ...prev, is_published: !prev.is_published } : null
      );
    }
    toast.success('Đã cập nhật trạng thái công bố đề thi!');
  };

  const isFiltered =
    search !== '' ||
    selectedSubject !== 'ALL' ||
    selectedGrade !== 'ALL' ||
    selectedStatus !== 'ALL' ||
    selectedVariant !== 'ALL';

  const filteredExams = exams.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase());

    const matchSubject =
      selectedSubject === 'ALL' || e.subject === selectedSubject;

    const matchGrade =
      selectedGrade === 'ALL' || e.grade_level === selectedGrade;

    const matchStatus =
      selectedStatus === 'ALL' ||
      (selectedStatus === 'PUBLISHED' && e.is_published) ||
      (selectedStatus === 'DRAFT' && !e.is_published);

    const matchVariant =
      selectedVariant === 'ALL' || String(e.variant_count) === selectedVariant;

    return matchSearch && matchSubject && matchGrade && matchStatus && matchVariant;
  });

  // Phân trang 10 đề mỗi trang
  const totalPages = Math.ceil(filteredExams.length / ITEMS_PER_PAGE);
  const paginatedExams = filteredExams.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Sinh danh sách mã đề dựa theo variant_count
  const variantList = selectedExamDetail
    ? Array.from({ length: selectedExamDetail.variant_count }, (_, i) => String(101 + i))
    : [];

  const answerMatrix = selectedExamDetail
    ? generateAnswerMatrix(activeVariantCode, selectedExamDetail.total_questions)
    : [];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
            <FileCheck2 className="w-3.5 h-3.5 mr-1" />
            System Exams
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Kho Đề Thi Chuẩn Hóa Cấp Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Các bộ đề thi thử khảo sát năng lực dùng chung cho toàn nền tảng và khách luyện thi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/exams/create-matrix">
            <Button className="bg-primary hover:bg-primary/90 text-white text-xs gap-1.5 font-semibold shadow-xs">
              <Wand2 className="w-4 h-4" />
              Tạo Đề Tự Động Theo Ma Trận
            </Button>
          </Link>
        </div>
      </div>

      {/* Thẻ Thống Kê */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng số đề thi hệ thống</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{exams.length}</div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-emerald-600">Đã công bố (Khách thi thử)</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {exams.filter((e) => e.is_published).length}
          </div>
        </Card>
        <Card className="p-4 bg-white border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-sky-600">Đang dự thảo</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {exams.filter((e) => !e.is_published).length}
          </div>
        </Card>
      </div>

      {/* BỘ LỌC ĐA TIÊU CHÍ (Nằm trên 1 hàng ngang ở Desktop) */}
      <Card className="p-3.5 sm:p-4 bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề đề thi, môn học..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9 bg-slate-50 border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white"
            />
          </div>

          {/* Nhóm các dropdown lọc - grid trên mobile/tablet, flex ngang trên desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:items-center gap-2 shrink-0">
            {/* Lọc Môn học */}
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-36"
            >
              <option value="ALL">Tất cả môn học</option>
              <option value="Toán học">Toán học</option>
              <option value="Vật lí">Vật lí</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Sinh học">Sinh học</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Lịch sử">Lịch sử</option>
              <option value="Địa lí">Địa lí</option>
            </select>

            {/* Lọc Khối lớp */}
            <select
              value={selectedGrade}
              onChange={(e) => handleGradeChange(e.target.value)}
              className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-32"
            >
              <option value="ALL">Tất cả khối lớp</option>
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12">Lớp 12</option>
              <option value="ĐGNL">ĐGNL</option>
            </select>

            {/* Lọc Trạng thái */}
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-36"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PUBLISHED">Đã công bố</option>
              <option value="DRAFT">Bản nháp</option>
            </select>

            {/* Lọc Số mã đề */}
            <select
              value={selectedVariant}
              onChange={(e) => handleVariantChange(e.target.value)}
              className="h-9 bg-slate-50 border border-slate-200 text-xs rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-primary focus:bg-white font-medium lg:w-32"
            >
              <option value="ALL">Tất cả số mã đề</option>
              <option value="2">2 mã đề</option>
              <option value="4">4 mã đề</option>
              <option value="8">8 mã đề</option>
            </select>

            {/* Nút đặt lại bộ lọc */}
            {isFiltered && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetFilters}
                className="col-span-2 sm:col-span-4 lg:col-span-1 text-xs text-slate-500 hover:text-slate-900 gap-1.5 h-9 px-2.5 shrink-0 whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Danh Sách Đề Thi (Đã phân trang 10 đề/trang) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.length === 0 ? (
          <div className="col-span-full text-center py-12 p-6 rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs shadow-xs">
            Không tìm thấy đề thi nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          paginatedExams.map((exam) => (
            <Card
              key={exam.id}
              className="p-5 bg-white border border-slate-200/80 hover:border-primary/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                      {exam.subject}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-700 border-slate-200">
                      Khối {exam.grade_level}
                    </Badge>
                  </div>

                  {exam.is_published ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-semibold">
                      Đã công bố
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px] font-medium">
                      Bản nháp
                    </Badge>
                  )}
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-2">
                  {exam.title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div>
                  Số câu: <strong className="text-slate-800">{exam.total_questions}</strong>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exam.duration_minutes} phút</span>
                </div>
                <div>
                  Mã đề: <strong className="text-primary font-bold">{exam.variant_count} mã đề</strong>
                </div>
                <div>
                  Điểm qua: <strong className="text-slate-800">{exam.pass_score}đ</strong>
                </div>
              </div>

              {/* Nút Xem Chi Tiết & Bảng Đáp Án */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedExamDetail(exam);
                    setActiveVariantCode('101');
                  }}
                  className="w-full border-slate-200 hover:border-primary hover:text-primary hover:bg-primary/5 text-xs text-slate-700 font-semibold gap-1.5 transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết & Bảng đáp án</span>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Phân trang: Tự động hiển thị khi số lượng đề thi > 10 */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredExams.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      {/* MODAL XEM CHI TIẾT ĐỀ THI & MA TRẬN BẢNG ĐÁP ÁN */}
      {selectedExamDetail && (
        <Dialog
          isOpen={Boolean(selectedExamDetail)}
          onClose={() => setSelectedExamDetail(null)}
          title={
            <div className="flex items-center gap-2 text-base font-bold text-slate-900">
              <FileCheck2 className="w-5 h-5 text-primary" />
              Chi Tiết Đề Thi & Bảng Đáp Án Hệ Thống
            </div>
          }
          description="Tra cứu ma trận câu hỏi, các mã đề hoán vị và bảng soi đáp án chi tiết phục vụ khảo thí."
          maxWidth="4xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTogglePublish(selectedExamDetail.id)}
                  className={`text-xs gap-1.5 font-semibold ${
                    selectedExamDetail.is_published
                      ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {selectedExamDetail.is_published ? 'Thu hồi (Chuyển về Nháp)' : 'Công bố (Cho khách thi thử)'}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/student/exam/${selectedExamDetail.id}`}
                  target="_blank"
                  className="inline-flex"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-primary/30 text-primary hover:bg-primary/5 gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Thi thử nghiệm (Portal học sinh)
                  </Button>
                </Link>

                <Button
                  size="sm"
                  onClick={() => setSelectedExamDetail(null)}
                  className="bg-primary hover:bg-primary/90 text-white text-xs font-semibold"
                >
                  Đóng
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
            {/* Header tóm tắt đề thi */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-semibold text-xs">
                    {selectedExamDetail.subject}
                  </Badge>
                  <Badge variant="outline" className="bg-white border-slate-200 text-slate-700 text-xs">
                    Khối {selectedExamDetail.grade_level}
                  </Badge>
                  {selectedExamDetail.is_published ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                      Đang công bố công khai
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-200 text-slate-700 text-xs">
                      Bản nháp nội bộ
                    </Badge>
                  )}
                </div>

                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Ngày tạo: {selectedExamDetail.created_at}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">
                {selectedExamDetail.title}
              </h2>

              {/* 4 Thống số cơ bản */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500">Thời gian làm bài</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedExamDetail.duration_minutes} phút</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500">Tổng số câu hỏi</div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{selectedExamDetail.total_questions} câu</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500">Số mã đề hoán vị</div>
                  <div className="text-base font-bold text-primary mt-0.5">{selectedExamDetail.variant_count} mã đề</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500">Điểm chuẩn qua môn</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">{selectedExamDetail.pass_score} / 10đ</div>
                </div>
              </div>
            </div>

            {/* Phân bố ma trận nhận thức Bloom */}
            <div className="space-y-2 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Cấu Trúc Ma Trận Nhận Thức (Bloom)
                </span>
                <span className="text-slate-400 font-normal text-[11px]">
                  Tỉ lệ chuẩn 40% - 30% - 20% - 10%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 flex overflow-hidden">
                <div style={{ width: '40%' }} className="bg-emerald-500" title="Nhận biết: 40%" />
                <div style={{ width: '30%' }} className="bg-sky-500" title="Thông hiểu: 30%" />
                <div style={{ width: '20%' }} className="bg-amber-500" title="Vận dụng: 20%" />
                <div style={{ width: '10%' }} className="bg-rose-500" title="Vận dụng cao: 10%" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>Nhận biết: <strong>{Math.round(selectedExamDetail.total_questions * 0.4)} câu (40%)</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-sky-50 text-sky-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                  <span>Thông hiểu: <strong>{Math.round(selectedExamDetail.total_questions * 0.3)} câu (30%)</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Vận dụng: <strong>{Math.round(selectedExamDetail.total_questions * 0.2)} câu (20%)</strong></span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                  <span>VDC: <strong>{Math.round(selectedExamDetail.total_questions * 0.1)} câu (10%)</strong></span>
                </div>
              </div>
            </div>

            {/* BẢNG ĐÁP ÁN THEO MÃ ĐỀ HOÁN VỊ (Answer Key Matrix) */}
            <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Bảng Đáp Án Chuẩn Theo Mã Đề
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Chọn mã đề bên dưới để soi đáp án nhanh tương ứng cho từng câu hỏi.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Đã xuất phiếu đáp án mã đề ${activeVariantCode} sang Excel!`)}
                    className="h-8 text-xs gap-1 border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Xuất Excel
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Đã xuất file Word đề thi mã ${activeVariantCode}!`)}
                    className="h-8 text-xs gap-1 border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    Xuất Word
                  </Button>
                </div>
              </div>

              {/* Tab chọn mã đề */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">
                  Chọn mã đề:
                </span>
                {variantList.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setActiveVariantCode(code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      activeVariantCode === code
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Mã {code}
                  </button>
                ))}
              </div>

              {/* Lưới hiển thị đáp án nhanh (Answer Matrix Grid) */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 pt-2">
                {answerMatrix.map((item) => {
                  const colorMap: Record<string, string> = {
                    A: 'bg-blue-50 text-blue-700 border-blue-200',
                    B: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    C: 'bg-amber-50 text-amber-700 border-amber-200',
                    D: 'bg-purple-50 text-purple-700 border-purple-200',
                  };
                  const badgeColor = colorMap[item.answer] || 'bg-slate-50 text-slate-700 border-slate-200';

                  return (
                    <div
                      key={item.qNum}
                      className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-2xs transition-all"
                    >
                      <span className="text-[10px] text-slate-400 font-mono">
                        Câu {item.qNum}
                      </span>
                      <span
                        className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shadow-2xs ${badgeColor}`}
                      >
                        {item.answer}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
