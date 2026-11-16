'use client';

import * as React from 'react';
import Link from 'next/link';
import { UserX, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth.store';
import { resolveTeacherId } from '@/services/teacher.service';
import { questionBankService } from '@/services/question-bank.service';
import { Question, QuestionBank } from '@/types';
import { BankFormValues } from './question.schema';
import { QuestionBankPanel } from './QuestionBankPanel';
import { QuestionBankFormDialog } from './QuestionBankFormDialog';
import { QuestionListPanel } from './QuestionListPanel';
import { QuestionEditorForm } from './QuestionEditorForm';

let idSeq = 0;
const uid = (prefix: string) => `${prefix}-${++idSeq}`;

export function QuestionStudioView() {
  const { user } = useAuthStore();
  const teacherId = React.useMemo(() => resolveTeacherId(user), [user]);

  const [banks, setBanks] = React.useState<QuestionBank[]>([]);
  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);
  const [isBankDialogOpen, setIsBankDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!teacherId) return;
    let active = true;
    (async () => {
      const list = await questionBankService.getBanks(teacherId);
      if (!active) return;
      setBanks(list);
      setSelectedBankId((prev) => prev ?? list[0]?.id ?? null);
      setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [teacherId]);

  const selectedBank = React.useMemo(
    () => banks.find((b) => b.id === selectedBankId),
    [banks, selectedBankId]
  );
  const questions = React.useMemo(() => selectedBank?.questions ?? [], [selectedBank]);
  const selectedQuestion = React.useMemo(
    () => questions.find((q) => q.id === selectedQuestionId),
    [questions, selectedQuestionId]
  );

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  const selectBank = (id: string) => {
    setSelectedBankId(id);
    setSelectedQuestionId(null);
    setIsEditorOpen(false);
  };

  const openQuestion = (id: string) => {
    setSelectedQuestionId(id);
    setIsEditorOpen(true);
  };

  const handleTogglePremium = async (bank: QuestionBank, value: boolean) => {
    await questionBankService.togglePremium(bank.id, value);
    setBanks((prev) => prev.map((b) => (b.id === bank.id ? { ...b, is_premium: value } : b)));
  };

  const handleCreateBank = async (values: BankFormValues) => {
    if (!teacherId) return;
    const bank = await questionBankService.createBank({
      title: values.title,
      subject: values.subject,
      description: values.description,
      is_premium: values.is_premium,
      owner_id: teacherId,
      school_id: user?.school_memberships?.[0]?.school_id,
    });
    setBanks((prev) => [bank, ...prev]);
    setSelectedBankId(bank.id);
    setSelectedQuestionId(null);
    flash('Đã tạo ngân hàng đề mới.');
  };

  const handleDeleteBank = async (bankId: string) => {
    await questionBankService.deleteBank(bankId);
    setBanks((prev) => {
      const next = prev.filter((b) => b.id !== bankId);
      if (selectedBankId === bankId) {
        setSelectedBankId(next[0]?.id ?? null);
        setSelectedQuestionId(null);
      }
      return next;
    });
  };

  const handleAddQuestion = () => {
    if (!selectedBank) return;
    const qId = uid('q');
    const question: Question = {
      id: qId,
      bank_id: selectedBank.id,
      type: 'SINGLE_CHOICE',
      title: '',
      content: '',
      points: 2.5,
      answers: [
        { id: uid('a'), question_id: qId, content: '', is_answer: true },
        { id: uid('a'), question_id: qId, content: '', is_answer: false },
      ],
    };
    setBanks((prev) =>
      prev.map((b) => (b.id === selectedBank.id ? { ...b, questions: [...(b.questions || []), question] } : b))
    );
    setSelectedQuestionId(qId);
    setIsEditorOpen(true);
  };

  const handleSaveQuestion = async (question: Question) => {
    if (!selectedBank) return;
    await questionBankService.saveQuestion(selectedBank.id, question);
    setBanks((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBank.id) return b;
        const list = b.questions || [];
        const exists = list.some((q) => q.id === question.id);
        const nextQuestions = exists ? list.map((q) => (q.id === question.id ? question : q)) : [...list, question];
        return { ...b, questions: nextQuestions, questions_count: nextQuestions.length };
      })
    );
    flash('Đã lưu câu hỏi.');
    setIsEditorOpen(false);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedBank) return;
    await questionBankService.deleteQuestion(selectedBank.id, questionId);
    setBanks((prev) =>
      prev.map((b) =>
        b.id === selectedBank.id
          ? { ...b, questions: (b.questions || []).filter((q) => q.id !== questionId) }
          : b
      )
    );
    setSelectedQuestionId(null);
    setIsEditorOpen(false);
  };

  if (!user || (teacherId && isLoading)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-4 h-[520px]" />
          <Skeleton className="lg:col-span-8 h-[520px]" />
        </div>
      </div>
    );
  }

  if (!teacherId) {
    return (
      <Card className="p-10 flex flex-col items-center text-center space-y-3">
        <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
          <UserX className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Chưa Tìm Thấy Hồ Sơ Giáo Viên</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Vui lòng đăng nhập bằng cổng Giáo viên để quản lý ngân hàng đề.
        </p>
        <Link href="/login/teacher">
          <Button className="mt-2">Đăng Nhập Cổng Giáo Viên</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="purple" className="mb-2">Studio Ngân Hàng Đề</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Soạn Câu Hỏi & Quản Lý Ngân Hàng Đề
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý ngân hàng đề (Premium) và soạn câu hỏi động theo loại: nhiều đáp án, 1 đáp án, Đúng/Sai, tự luận.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4" /> {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card className="p-4 sm:p-5 h-full">
            <QuestionBankPanel
              banks={banks}
              selectedBankId={selectedBankId}
              onSelect={selectBank}
              onTogglePremium={handleTogglePremium}
              onOpenCreate={() => setIsBankDialogOpen(true)}
              onDelete={handleDeleteBank}
            />
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="p-4 sm:p-5 h-full">
            {selectedBank ? (
              <QuestionListPanel
                questions={questions}
                selectedQuestionId={selectedQuestionId}
                onSelect={openQuestion}
                onAdd={handleAddQuestion}
                onDelete={handleDeleteQuestion}
              />
            ) : (
              <div className="text-center py-16 text-xs text-slate-400">
                Chọn một ngân hàng đề để xem câu hỏi.
              </div>
            )}
          </Card>
        </div>
      </div>

      <Dialog
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="Soạn Câu Hỏi"
        description="Cập nhật nội dung, đáp án (Answer) và giải thích."
        maxWidth="2xl"
      >
        {selectedBank && selectedQuestion ? (
          <QuestionEditorForm
            bankId={selectedBank.id}
            question={selectedQuestion}
            onSave={handleSaveQuestion}
            onDelete={() => selectedQuestion && handleDeleteQuestion(selectedQuestion.id)}
          />
        ) : null}
      </Dialog>

      <QuestionBankFormDialog
        isOpen={isBankDialogOpen}
        onClose={() => setIsBankDialogOpen(false)}
        onCreate={handleCreateBank}
      />
    </div>
  );
}
