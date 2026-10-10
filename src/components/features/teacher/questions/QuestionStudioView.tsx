'use client';

import * as React from 'react';
import { QuestionBankList } from './QuestionBankList';
import { QuestionBankDetail } from './QuestionBankDetail';
import { QuestionFormModal } from './QuestionFormModal';
import { QuestionImportModal } from './QuestionImportModal';
import { questionBankService } from '@/services/question-bank.service';
import { Question } from '@/types';

export function QuestionStudioView() {
  const [selectedBankId, setSelectedBankId] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Modal States
  const [isQuestionModalOpen, setIsQuestionModalOpen] = React.useState(false);
  const [editingQuestion, setEditingQuestion] = React.useState<Question | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importTargetBankId, setImportTargetBankId] = React.useState<string | null>(null);

  const handleOpenQuestionModal = (question?: Question) => {
    setEditingQuestion(question || null);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (question: Question) => {
    if (!selectedBankId) return;
    await questionBankService.saveQuestion(selectedBankId, question);
    setRefreshKey((prev) => prev + 1);
    setIsQuestionModalOpen(false);
  };

  const handleOpenImportModal = (bankId?: string) => {
    setImportTargetBankId(bankId || selectedBankId || null);
    setIsImportModalOpen(true);
  };

  const handleImportSuccess = (count: number, bankId: string) => {
    setRefreshKey((prev) => prev + 1);
    if (!selectedBankId) {
      setSelectedBankId(bankId);
    }
  };

  return (
    <div className="space-y-6">
      {selectedBankId ? (
        <QuestionBankDetail
          key={`${selectedBankId}-${refreshKey}`}
          bankId={selectedBankId}
          onBack={() => setSelectedBankId(null)}
          onOpenQuestionModal={handleOpenQuestionModal}
          onOpenImportModal={handleOpenImportModal}
        />
      ) : (
        <QuestionBankList
          onSelectBank={(bankId) => setSelectedBankId(bankId)}
          onOpenImportModal={handleOpenImportModal}
        />
      )}

      {/* Modal Soạn Câu Hỏi Thủ Công */}
      {selectedBankId && (
        <QuestionFormModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
          bankId={selectedBankId}
          questionToEdit={editingQuestion}
          onSave={handleSaveQuestion}
        />
      )}

      {/* Modal Wizard Import File Word / Excel 4 Bước */}
      <QuestionImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        targetBankId={importTargetBankId}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
