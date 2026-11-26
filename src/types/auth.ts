export type SystemRole = 'SUPER_ADMIN' | 'USER';

export interface User {
  id: string;
  role: SystemRole;
  fullname: string;
  avatar_url?: string | null;
  email: string;
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
