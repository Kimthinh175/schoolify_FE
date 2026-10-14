import { QuestionType, QuestionBank, Question, Answer } from './exam';

export type { QuestionType, QuestionBank, Question, Answer };

export interface ParsedQuestionItem {
  temp_id: string;
  question_type: QuestionType;
  content: string;
  img_urls?: string[];
  explain?: string;
  points?: number;
  is_valid: boolean;
  validation_errors: string[];
  answers: Array<{
    content: string;
    is_correct: boolean;
  }>;
}

export interface ParseImportSummary {
  total_parsed: number;
  valid_count: number;
  invalid_count: number;
}

export interface ParseImportResult {
  summary: ParseImportSummary;
  parsed_questions: ParsedQuestionItem[];
  raw_text?: string;
}
