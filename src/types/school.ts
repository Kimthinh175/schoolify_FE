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

export interface Class {
  id: string;
  school_id: string;
  teacher_id?: string | null;
  name: string;
  code: string;
  room?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  student_count?: number;
  teacher_name?: string;
  created_at: string;
}

export interface ClassSession {
  id: string;
  class_id: string;
  teacher_id?: string | null;
  title: string;
  room?: string | null;
  meeting_url?: string | null;
  start_time: string;
  end_time: string;
  teacher_name?: string;
  class_name?: string;
}
