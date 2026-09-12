import { Course, CourseStatus, Class, TeacherProfile, Transaction, User } from '@/types';
import {
  MOCK_TEACHER_PROFILE,
  MOCK_TEACHER_COURSES,
  MOCK_TEACHER_CLASSES,
  MOCK_TEACHER_TRANSACTIONS,
} from './mock/data';

export type CourseStatusFilter = 'ALL' | CourseStatus;

export interface TeacherDashboardStats {
  /** Tổng thu nhập thực nhận từ bán khóa học (TransactionType: TEACHER_INCOME) */
  totalIncome: number;
  /** Tổng phí sàn nền tảng đã trích (TransactionType: COMMISSION_FEE) */
  totalCommissionFee: number;
  /** Tổng số học viên theo học các khóa của giáo viên */
  totalStudents: number;
  /** Số lớp giáo viên đang phụ trách */
  totalClasses: number;
  /** Tổng số khóa học giáo viên sở hữu */
  totalCourses: number;
  /** Số khóa đang mở bán trên Marketplace */
  marketplaceCourses: number;
  /** Số khóa đang chờ duyệt */
  pendingCourses: number;
}

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/** Danh sách hồ sơ giáo viên (mock) dùng để phân giải teacher_id theo user_id */
const TEACHER_PROFILES: TeacherProfile[] = [MOCK_TEACHER_PROFILE];

/**
 * Phân giải teacher_id của giáo viên đang đăng nhập theo ERD:
 * ưu tiên User.teacher_profile, nếu không có thì khớp TeacherProfile.user_id với User.id.
 */
export function resolveTeacherId(user: User | null): string | null {
  if (!user) return null;
  if (user.teacher_profile?.id) return user.teacher_profile.id;
  return TEACHER_PROFILES.find((p) => p.user_id === user.id)?.id ?? null;
}

export const teacherService = {
  /** Hồ sơ giáo viên theo teacher_id (Bảng ERD: TeacherProfile) */
  async getProfile(teacherId: string): Promise<TeacherProfile | undefined> {
    await delay();
    return TEACHER_PROFILES.find((p) => p.id === teacherId);
  },

  /** Danh sách khóa học của giáo viên (Bảng ERD: Course), lọc theo teacher_id + CourseStatus */
  async getMyCourses(teacherId: string, status: CourseStatusFilter = 'ALL'): Promise<Course[]> {
    await delay();
    const owned = MOCK_TEACHER_COURSES.filter((c) => c.teacher_id === teacherId);
    if (status === 'ALL') return owned;
    return owned.filter((c) => c.status === status);
  },

  /** Danh sách lớp giáo viên đang phụ trách */
  async getMyClasses(teacherId: string): Promise<Class[]> {
    await delay();
    return MOCK_TEACHER_CLASSES.filter((c) => c.teacher_id === teacherId);
  },

  /** Lịch sử giao dịch của giáo viên (TEACHER_INCOME / COMMISSION_FEE) */
  async getTransactions(teacherId: string): Promise<Transaction[]> {
    await delay();
    return MOCK_TEACHER_TRANSACTIONS.filter((t) => t.teacher_id === teacherId);
  },

  /** Tổng hợp KPI hiển thị trên Dashboard Giáo Viên (theo teacher_id) */
  async getDashboardStats(teacherId: string): Promise<TeacherDashboardStats> {
    await delay();
    const courses = MOCK_TEACHER_COURSES.filter((c) => c.teacher_id === teacherId);
    const classes = MOCK_TEACHER_CLASSES.filter((c) => c.teacher_id === teacherId);
    const transactions = MOCK_TEACHER_TRANSACTIONS.filter((t) => t.teacher_id === teacherId);

    const totalIncome = transactions
      .filter((t) => t.type === 'TEACHER_INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalCommissionFee = transactions
      .filter((t) => t.type === 'COMMISSION_FEE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalCommissionFee,
      totalStudents: courses.reduce((sum, c) => sum + (c.total_students || 0), 0),
      totalClasses: classes.length,
      totalCourses: courses.length,
      marketplaceCourses: courses.filter((c) => c.is_marketplace).length,
      pendingCourses: courses.filter((c) => c.status === 'PENDING').length,
    };
  },

  /** Bật/tắt bán khóa học trên Marketplace (is_marketplace) — chỉ khóa thuộc teacher_id */
  async toggleMarketplace(
    teacherId: string,
    courseId: string,
    value: boolean
  ): Promise<Course | undefined> {
    await delay(150);
    const course = MOCK_TEACHER_COURSES.find(
      (c) => c.id === courseId && c.teacher_id === teacherId
    );
    if (course) {
      course.is_marketplace = value;
      course.updated_at = new Date().toISOString();
    }
    return course;
  },
};
