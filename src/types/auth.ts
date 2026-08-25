export type SystemRole = 'SUPER_ADMIN' | 'USER';

export type SchoolRole = 
  | 'PRINCIPAL' 
  | 'VICE_PRINCIPAL' 
  | 'HEAD_OF_DEPARTMENT' 
  | 'TEACHER' 
  | 'STUDENT' 
  | 'PARENT' 
  | 'STAFF';

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

  // Profiles
  teacher_profile?: TeacherProfile | null;
  student_profile?: StudentProfile | null;
  parent_profile?: ParentProfile | null;
  school_memberships?: SchoolMember[];
}

export interface TeacherProfile {
  id: string;
  user_id: string;
  department_id?: string | null;
  department_name?: string | null;
  bio?: string | null;
  expertise?: string | null;
  experience_years?: number | null;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  date_of_birth?: string | null;
  grade_level?: string | null;
  points: number;
  created_at?: string;
}

export interface ParentProfile {
  id: string;
  user_id: string;
  job_title?: string | null;
  address?: string | null;
  students?: StudentProfile[];
}

export interface SchoolMember {
  id: string;
  user_id: string;
  school_id: string;
  school_name?: string;
  role: SchoolRole;
  joined_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  currentRole: SchoolRole | SystemRole | null;
  currentSchoolId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
