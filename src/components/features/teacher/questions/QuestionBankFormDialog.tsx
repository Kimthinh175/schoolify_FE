'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
import { bankFormSchema, BankFormValues } from './question.schema';

const EMPTY: BankFormValues = { title: '', subject: '', description: '', is_premium: false };

export function QuestionBankFormDialog({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (values: BankFormValues) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BankFormValues>({
    resolver: zodResolver(bankFormSchema),
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (isOpen) reset(EMPTY);
  }, [isOpen, reset]);

  const submit = (values: BankFormValues) => {
    onCreate(values);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Ngân Hàng Đề Mới"
      description="Điền thông tin cơ bản cho ngân hàng câu hỏi."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4 py-2">
        <Input
          label="Tên ngân hàng đề *"
          placeholder="VD: Ngân hàng Toán 12 – Lượng giác"
          error={errors.title?.message}
          {...register('title')}
        />
        <Input label="Môn học" placeholder="VD: Toán học" {...register('subject')} />
        <Textarea label="Mô tả" placeholder="Mô tả ngắn về phạm vi câu hỏi..." {...register('description')} />
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
          <input type="checkbox" className="rounded accent-[#00B8DD]" {...register('is_premium')} />
          Đánh dấu là ngân hàng <Badge variant="warning" className="text-[10px]">Premium</Badge>
        </label>
        <Button type="submit" className="w-full justify-center" leftIcon={<Plus className="w-4 h-4" />}>
          Tạo Ngân Hàng Đề
        </Button>
      </form>
    </Dialog>
  );
}
