export type SystemRole = 'SUPER_ADMIN' | 'USER';

export interface User {
  id: string;
  role: SystemRole;
  fullname: string;
  avatar_url?: string | null;
  email: string;
  google_id?: string | null;
  phone?: string | null;
  status: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;

  // Profile
  student_profile?: StudentProfile | null;

  // Competency
  competency_level?: string | null;
  assessed_subjects?: Record<string, string>;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  date_of_birth?: string | null;
  grade_level?: string | null;
  points: number;
  exam_points?: number;
  last_daily_grant_date?: string | null;
  active_package?: string | null;
  package_expires_at?: string | null;
  school_name?: string | null;
  province?: string | null;
  bio?: string | null;
  equipped_frame?: string | null;
  competency_level?: string | null;
  assessed_subjects?: Record<string, string>;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  currentRole: SystemRole | 'STUDENT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
