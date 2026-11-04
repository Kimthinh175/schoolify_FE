import {
  QuestionType,
  QuestionBank,
  Question,
  Answer,
  DifficultyLevel,
  MatchingPair,
  OrderingItem,
  ClozeBlank,
} from './exam';

export type {
  QuestionType,
  QuestionBank,
  Question,
  Answer,
  DifficultyLevel,
  MatchingPair,
  OrderingItem,
  ClozeBlank,
};

export interface ParsedQuestionItem {
  temp_id: string;
  question_type: QuestionType;
  title?: string;
  content: string;
  img_urls?: string[];
  explain?: string;
  points?: number;
  chapter?: string | null;
  difficulty?: DifficultyLevel;
  group_code?: string;
  is_valid: boolean;
  validation_errors: string[];
  answers: Array<{
    content: string;
    is_correct: boolean;
    label?: string;
  }>;
  matching_pairs?: MatchingPair[];
  ordering_items?: OrderingItem[];
  cloze_blanks?: ClozeBlank[];
  passage_content?: string | null;
  sub_questions?: Question[];
  statements?: { subId: string; statement: string; isCorrect: boolean; explanation?: string }[];
  shortAnswerCorrect?: string;
  sample_essay_answer?: string | null;
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
