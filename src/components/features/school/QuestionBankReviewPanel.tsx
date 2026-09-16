'use client';

import * as React from 'react';
import {
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileQuestion,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { MOCK_DEPARTMENTS, MOCK_QUESTION_BANKS } from '@/services/mock/data';
import { questionBankService } from '@/services/question-bank.service';
import { QuestionBank, QuestionBankReviewStatus } from '@/types';

const statusTabs: { id: QuestionBankReviewStatus; label: string }[] = [
  { id: 'PENDING', label: 'Chờ duyệt' },
  { id: 'APPROVED', label: 'Đã chuẩn hóa' },
  { id: 'REJECTED', label: 'Yêu cầu chỉnh sửa' },
];

type ReviewAction = 'APPROVE' | 'REJECT';

function getStatusMeta(status: QuestionBankReviewStatus) {
  if (status === 'APPROVED') return { label: 'Đã chuẩn hóa', variant: 'success' as const };
  if (status === 'REJECTED') return { label: 'Yêu cầu chỉnh sửa', variant: 'danger' as const };
  if (status === 'DRAFT') return { label: 'Bản nháp', variant: 'secondary' as const };
  return { label: 'Chờ duyệt', variant: 'warning' as const };
}

function formatDate(date?: string | null) {
  if (!date) return 'Chưa cập nhật';
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return 'Chưa cập nhật';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parsedDate);
}

function questionTypeLabel(type: string) {
  if (type === 'MULTIPLE_CHOICE') return 'Nhiều đáp án đúng';
  if (type === 'SINGLE_CHOICE') return 'Một đáp án đúng';
  if (type === 'TRUE_FALSE') return 'Đúng / Sai';
  return 'Tự luận';
}

export function QuestionBankReviewPanel() {
  const [banks, setBanks] = React.useState<QuestionBank[]>(() =>
    MOCK_QUESTION_BANKS.map((bank) => ({ ...bank, status: bank.status || 'PENDING' }))
  );
  const [activeStatus, setActiveStatus] = React.useState<QuestionBankReviewStatus>('PENDING');
  const [selectedDepartment, setSelectedDepartment] = React.useState('ALL');
  const [selectedTeacher, setSelectedTeacher] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBank, setSelectedBank] = React.useState<QuestionBank | null>(null);
  const [actionType, setActionType] = React.useState<ReviewAction | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [feedbackError, setFeedbackError] = React.useState('');

  const teachers = Array.from(
    new Map(
      banks.map((bank) => [bank.owner_id || 'unknown', { id: bank.owner_id || 'unknown', name: bank.teacher_name || 'Chưa cập nhật' }])
    ).values()
  );

  const filteredBanks = banks.filter((bank) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query
      || bank.title.toLowerCase().includes(query)
      || (bank.subject || '').toLowerCase().includes(query)
      || (bank.teacher_name || '').toLowerCase().includes(query)
      || (bank.chapter_name || '').toLowerCase().includes(query);
    const matchesDepartment = selectedDepartment === 'ALL' || bank.department_name === selectedDepartment;
    const matchesTeacher = selectedTeacher === 'ALL' || bank.owner_id === selectedTeacher;
    return matchesSearch && matchesDepartment && matchesTeacher;
  });

  const visibleBanks = filteredBanks.filter((bank) => (bank.status || 'PENDING') === activeStatus);
  const counts = statusTabs.reduce<Record<string, number>>((result, tab) => {
    result[tab.id] = filteredBanks.filter((bank) => (bank.status || 'PENDING') === tab.id).length;
    return result;
  }, {});

  const openDetails = (bank: QuestionBank) => {
    setSelectedBank(bank);
    setActionType(null);
    setFeedback('');
    setFeedbackError('');
  };

  const openAction = (bank: QuestionBank, action: ReviewAction) => {
    setSelectedBank(bank);
    setActionType(action);
    setFeedback('');
    setFeedbackError('');
  };

  const closeDialog = () => {
    setSelectedBank(null);
    setActionType(null);
    setFeedback('');
    setFeedbackError('');
  };

  const handleReview = async () => {
    if (!selectedBank || !actionType) return;
    if (actionType === 'REJECT' && !feedback.trim()) {
      setFeedbackError('Vui lòng nhập nhận xét để giáo viên biết nội dung cần chỉnh sửa.');
      return;
    }

    const status: QuestionBankReviewStatus = actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updatedBank = await questionBankService.updateReviewStatus(selectedBank.id, status, feedback.trim());
    if (!updatedBank) return;

    setBanks((previousBanks) => previousBanks.map((bank) => bank.id === updatedBank.id ? { ...bank, ...updatedBank } : bank));
    closeDialog();
  };

  const resetFilters = () => {
    setSelectedDepartment('ALL');
    setSelectedTeacher('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-500">Tổng ngân hàng đề</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{filteredBanks.length}</p>
          <p className="mt-1 text-xs text-slate-500">Theo bộ lọc hiện tại</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-500">Cần kiểm tra</p>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{counts.PENDING || 0}</p>
          <p className="mt-1 text-xs text-slate-500">Đang chờ HOD chuẩn hóa</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-500">Đã chuẩn hóa</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{counts.APPROVED || 0}</p>
          <p className="mt-1 text-xs text-slate-500">Có thể dùng để tạo kỳ thi</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <Filter className="h-4 w-4 text-primary" />
            Bộ lọc ngân hàng đề
          </div>
          <Button size="sm" variant="ghost" onClick={resetFilters}>Đặt lại</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 xl:col-span-2">
            Tìm kiếm
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Tên đề, môn học, chương hoặc giáo viên..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-normal text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Tổ chuyên môn
            <select value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="ALL">Tất cả tổ chuyên môn</option>
              {MOCK_DEPARTMENTS.map((department) => <option key={department.id} value={department.name}>{department.name}</option>)}
            </select>
          </label>
          <label className="space-y-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Giáo viên
            <select value={selectedTeacher} onChange={(event) => setSelectedTeacher(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="ALL">Tất cả giáo viên</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
          </label>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-5 pt-5 dark:border-slate-800">
          <Tabs
            variant="underline"
            activeTab={activeStatus}
            onChange={(tabId) => setActiveStatus(tabId as QuestionBankReviewStatus)}
            tabs={statusTabs.map((tab) => ({ ...tab, badge: counts[tab.id] || 0 }))}
          />
        </div>

        {visibleBanks.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-2 px-5 text-center">
            <Clock3 className="h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-700 dark:text-slate-200">Chưa có ngân hàng đề phù hợp</p>
            <p className="text-sm text-slate-500">Thử thay đổi bộ lọc hoặc trạng thái kiểm duyệt.</p>
          </div>
        ) : (
          <div className="space-y-3 p-4 sm:p-5">
            {visibleBanks.map((bank) => {
              const statusMeta = getStatusMeta(bank.status || 'PENDING');
              return (
                <article key={bank.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/35 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                      {bank.grade_level && <Badge variant="default">{bank.grade_level}</Badge>}
                      {bank.subject && <Badge variant="secondary">{bank.subject}</Badge>}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{bank.title}</h3>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                      {bank.teacher_name || 'Chưa cập nhật'} <span className="mx-1.5">•</span>{bank.department_name || 'Chưa cập nhật'}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {bank.chapter_name || 'Chưa phân chương'} <span className="mx-1.5">•</span>{bank.questions_count ?? bank.questions?.length ?? 0} câu hỏi <span className="mx-1.5">•</span>Cập nhật {formatDate(bank.updated_at)}
                    </p>
                    {bank.review_note && <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">Nhận xét gần nhất: {bank.review_note}</p>}
                  </div>
                  <div className="flex w-full flex-col gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 lg:w-52 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => openDetails(bank)} leftIcon={<Eye className="h-4 w-4" />}>Xem và kiểm tra</Button>
                    {bank.status === 'PENDING' && <>
                      <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => openAction(bank, 'REJECT')} leftIcon={<X className="h-4 w-4 text-rose-500" />}>Yêu cầu chỉnh sửa</Button>
                      <Button size="sm" variant="primary" className="w-full justify-start" onClick={() => openAction(bank, 'APPROVE')} leftIcon={<Check className="h-4 w-4" />}>Phê duyệt đề</Button>
                    </>}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Dialog
        isOpen={!!selectedBank}
        onClose={closeDialog}
        title={actionType === 'APPROVE' ? 'Xác nhận chuẩn hóa ngân hàng đề' : actionType === 'REJECT' ? 'Yêu cầu chỉnh sửa ngân hàng đề' : 'Kiểm tra ngân hàng đề'}
        description={selectedBank?.title}
        maxWidth="4xl"
      >
        {selectedBank && actionType ? (
          <div className="space-y-4 py-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
              <p className="font-semibold text-slate-900 dark:text-white">{selectedBank.title}</p>
              <p className="mt-1 text-xs text-slate-500">{selectedBank.questions?.length || 0} câu hỏi • {selectedBank.grade_level || 'Chưa có khối lớp'} • {selectedBank.chapter_name || 'Chưa có chương'}</p>
            </div>
            <Textarea
              label="Nhận xét chuyên môn"
              placeholder={actionType === 'APPROVE' ? 'Có thể ghi nhận xét chuẩn hóa cho giáo viên...' : 'Nêu rõ câu hỏi, đáp án hoặc lời giải cần chỉnh sửa...'}
              value={feedback}
              onChange={(event) => { setFeedback(event.target.value); if (event.target.value.trim()) setFeedbackError(''); }}
            />
            {feedbackError && <p className="text-xs font-medium text-rose-600">{feedbackError}</p>}
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={closeDialog}>Hủy</Button><Button variant={actionType === 'APPROVE' ? 'primary' : 'destructive'} onClick={handleReview}>{actionType === 'APPROVE' ? 'Phê duyệt đề' : 'Gửi yêu cầu sửa'}</Button></div>
          </div>
        ) : selectedBank ? (
          <div className="space-y-5 py-2">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Giáo viên</p><p className="mt-1 truncate font-semibold">{selectedBank.teacher_name || 'Chưa cập nhật'}</p></div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Phạm vi</p><p className="mt-1 font-semibold">{selectedBank.grade_level || 'Chưa cập nhật'}</p></div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Chương</p><p className="mt-1 truncate font-semibold">{selectedBank.chapter_name || 'Chưa cập nhật'}</p></div>
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs text-slate-500">Số câu</p><p className="mt-1 font-semibold">{selectedBank.questions?.length || 0}</p></div>
            </div>

            <section className="space-y-3">
              <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white"><FileQuestion className="h-4 w-4 text-primary" />Danh sách câu hỏi và đáp án</div>
              {(selectedBank.questions || []).map((question, index) => (
                <div key={question.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div><p className="text-xs font-semibold text-slate-500">Câu {index + 1} • {questionTypeLabel(question.type)} • {question.points} điểm</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{question.title || question.content}</p></div>
                    <Badge variant="secondary">{question.answers?.length || 0} đáp án</Badge>
                  </div>
                  {question.title && <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{question.content}</p>}
                  {question.type === 'ESSAY' ? <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200"><span className="font-semibold">Đáp án mẫu:</span> {question.sample_essay_answer || 'Chưa có đáp án mẫu.'}</div> : <div className="mt-3 space-y-2">{(question.answers || []).map((answer) => <div key={answer.id} className={`rounded-lg border px-3 py-2 text-sm ${answer.is_answer ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'}`}><div className="flex items-center gap-2"><span className="flex-1">{answer.content}</span>{answer.is_answer && <Badge variant="success" icon={<CheckCircle2 className="h-3 w-3" />}>Đáp án đúng</Badge>}</div>{answer.explain && <p className="mt-1 border-t border-current/10 pt-1 text-xs opacity-80"><span className="font-semibold">Lời giải:</span> {answer.explain}</p>}</div>)}</div>}
                </div>
              ))}
            </section>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
              <Button variant="outline" onClick={closeDialog}>Đóng</Button>
              {selectedBank.status === 'PENDING' && <><Button variant="destructive" onClick={() => openAction(selectedBank, 'REJECT')} leftIcon={<X className="h-4 w-4" />}>Yêu cầu chỉnh sửa</Button><Button variant="primary" onClick={() => openAction(selectedBank, 'APPROVE')} leftIcon={<Check className="h-4 w-4" />}>Phê duyệt đề</Button></>}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
