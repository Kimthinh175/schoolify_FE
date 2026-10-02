import { User, TeacherProfile } from './auth';

export type SchoolStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type BillingCycle = 'MONTHLY' | 'YEARLY' | 'LIFETIME';
export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'EXPIRED' | 'CANCELED' | 'UPGRADED';

export interface School {
  id: string;
  owner_id?: string | null;
  owner?: User | null;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: SchoolStatus;
  created_at: string;
  updated_at: string;
  current_subscription?: SchoolSubscription | null;
  departments_count?: number;
  students_count?: number;
  teachers_count?: number;
}

export interface Department {
  id: string;
  school_id: string;
  name: string;
  head_teacher_id?: string | null;
  head_teacher?: TeacherProfile | null;
  created_at: string;
  updated_at: string;
  teachers_count?: number;
  courses_count?: number;
}

export interface SubscriptionPackage {
  id: string;
  creator_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  billing_cycle: BillingCycle;
  duration_days?: number | null;
  max_teachers: number;
  max_students_total: number;
  max_classes: number;
  max_students_per_class: number;
  storage_limit_gb: number;
  can_sell_courses: boolean;
  is_active: boolean;
  features?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolSubscription {
  id: string;
  school_id: string;
  package_id: string;
  package?: SubscriptionPackage;
  features_snapshot?: any;
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  used_students_count?: number;
  used_teachers_count?: number;
  used_storage_gb?: number;
  created_at: string;
}

export type ClassStatus = 'ACTIVE' | 'UPCOMING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

/** ERD: Class (+ vài field mở rộng FE cho UI) */
export interface Class {
  id: string;
  school_id: string;
  teacher_id?: string | null;
  /** Khóa học gắn với lớp (ERD: course_id) */
  course_id?: string | null;
  /** Tên lớp (ERD: class_name) */
  class_name: string;
  /** Trạng thái lớp (ERD: status) */
  status: ClassStatus;
  // — Mở rộng cho UI —
  code?: string;
  room?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  student_count?: number;
  teacher_name?: string;
  created_at: string;
  updated_at?: string;
}

/** ERD: ClassCourse — bảng nối Lớp ↔ Khóa học (phân công khóa học vào lớp) */
export interface ClassCourse {
  id: string;
  teacher_id: string;
  course_id: string;
  class_id: string;
}

/** ERD: ClassSession */
export interface ClassSession {
  id: string;
  class_id: string;
  teacher_id?: string | null;
  title: string;
  room?: string | null;
  meeting_url?: string | null;
  start_time: string;
  end_time: string;
  // — Quan hệ / mở rộng cho UI —
  teacher_name?: string;
  class_name?: string;
  created_at?: string;
  updated_at?: string;
}
