export type CommunicationEntryType = 'EXAM_SCORE' | 'BEHAVIOR' | 'ATTENDANCE' | 'ANNOUNCEMENT';

export interface CommunicationBook {
  id: string;
  student_id: string;
  parent_id: string;
  class_id?: string;
  school_id: string;
  academic_year: string;
  created_at: string;
  updated_at?: string;
}

export interface CommunicationEntry {
  id: string;
  book_id: string;
  type: CommunicationEntryType;
  title: string;
  content: string;
  
  // Liên kết với kết quả điểm thi
  exam_submission_id?: string | null;
  exam_title?: string | null;
  score?: number | null;
  
  teacher_id: string;
  teacher_name: string;
  is_read: boolean;
  created_at: string;
}
