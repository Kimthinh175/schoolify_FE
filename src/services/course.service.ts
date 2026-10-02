import { Course, CourseStatus, CourseChapter, Lesson } from '@/types';
import { MOCK_COURSES, MOCK_TEACHER_COURSES } from './mock/data';

export const courseService = {
  async getCourses(filters?: { category?: string; search?: string }): Promise<Course[]> {
    await new Promise((r) => setTimeout(r, 200));
    let result = [...MOCK_COURSES];
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((c) => c.title.toLowerCase().includes(q) || c.teacher_name?.toLowerCase().includes(q));
    }
    return result;
  },

  async getCourseById(id: string): Promise<Course | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_COURSES.find((c) => c.id === id);
  },

  async getEnrolledCourses(): Promise<Course[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_COURSES.slice(0, 2);
  },

  // ===== Course Builder (Teacher) =====
  /** Lấy course để soạn thảo (clone sâu để tránh sửa trực tiếp mock trước khi Lưu) */
  async getCourseForBuilder(courseId: string): Promise<Course | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    const found =
      MOCK_TEACHER_COURSES.find((c) => c.id === courseId) ||
      MOCK_COURSES.find((c) => c.id === courseId);
    return found ? (JSON.parse(JSON.stringify(found)) as Course) : undefined;
  },

  /** Lưu (nháp) course từ builder vào mock data */
  async saveCourseDraft(course: Course): Promise<Course> {
    await new Promise((r) => setTimeout(r, 200));
    const payload: Course = { ...course, updated_at: new Date().toISOString() };
    const index = MOCK_TEACHER_COURSES.findIndex((c) => c.id === course.id);
    if (index >= 0) {
      MOCK_TEACHER_COURSES[index] = payload;
    } else {
      MOCK_TEACHER_COURSES.unshift(payload);
    }
    return payload;
  },

  /** Đổi trạng thái xuất bản (DRAFT -> PENDING -> PUBLISHED / HIDDEN) */
  async updateCourseStatus(courseId: string, status: CourseStatus): Promise<Course | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    const course = MOCK_TEACHER_COURSES.find((c) => c.id === courseId);
    if (course) {
      course.status = status;
      course.updated_at = new Date().toISOString();
    }
    return course;
  },
};
