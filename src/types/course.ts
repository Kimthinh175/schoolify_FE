export type CourseStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN';
export type MaterialType = 'IMG' | 'DOCX' | 'EXCEL' | 'PDF';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  courses_count?: number;
}

export interface Course {
  id: string;
  school_id?: string | null;
  teacher_id: string;
  department_id?: string | null;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  price: number;
  is_marketplace: boolean;
  status: CourseStatus;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  rating?: number;
  total_reviews?: number;
  total_students?: number;
  created_at: string;
  updated_at: string;

  // Relations
  teacher_name?: string;
  teacher_avatar?: string;
  department_name?: string;
  chapters?: CourseChapter[];
  total_lessons?: number;
  total_duration_mins?: number;
}

export interface CourseChapter {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  content?: string | null;
  video_url?: string | null;
  duration_mins?: number;
  is_free_preview: boolean;
  order_index: number;
  materials?: LessonMaterial[];
  is_completed?: boolean;
}

export interface LessonMaterial {
  id: string;
  lesson_id: string;
  title: string;
  file_url: string;
  file_type: MaterialType;
  file_size_bytes?: number;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  course_id: string;
  last_lesson_id?: string | null;
  completion_pct: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  is_finished: boolean;
  updated_at: string;
}
