import { Class, ClassCourse, ClassSession } from '@/types';
import { MOCK_TEACHER_CLASSES, MOCK_CLASS_COURSES, MOCK_TIMETABLE } from './mock/data';

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

let seq = 0;
const uid = (prefix: string) => `${prefix}-${++seq}`;

/** Service quản lý Lớp học & Thời khóa biểu (ERD: Class, ClassCourse, ClassSession) */
export const classService = {
  /** Danh sách lớp của giáo viên */
  async getClasses(teacherId: string): Promise<Class[]> {
    await delay();
    return MOCK_TEACHER_CLASSES.filter((c) => c.teacher_id === teacherId);
  },

  /** Buổi học của giáo viên (lọc theo khoảng thời gian nếu có) */
  async getSessions(
    teacherId: string,
    range?: { from: string; to: string }
  ): Promise<ClassSession[]> {
    await delay();
    let list = MOCK_TIMETABLE.filter((s) => s.teacher_id === teacherId);
    if (range) {
      const from = new Date(range.from).getTime();
      const to = new Date(range.to).getTime();
      list = list.filter((s) => {
        const t = new Date(s.start_time).getTime();
        return t >= from && t <= to;
      });
    }
    return [...list].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
  },

  /** Danh sách khóa học đã phân công cho 1 lớp (ClassCourse) */
  async getClassCourses(classId: string): Promise<ClassCourse[]> {
    await delay();
    return MOCK_CLASS_COURSES.filter((cc) => cc.class_id === classId);
  },

  /** Tất cả phân công khóa học của giáo viên */
  async getAllClassCourses(teacherId: string): Promise<ClassCourse[]> {
    await delay();
    return MOCK_CLASS_COURSES.filter((cc) => cc.teacher_id === teacherId);
  },

  /** Phân công khóa học vào lớp (chống trùng) */
  async assignCourse(payload: {
    class_id: string;
    course_id: string;
    teacher_id: string;
  }): Promise<ClassCourse> {
    await delay();
    const existing = MOCK_CLASS_COURSES.find(
      (cc) => cc.class_id === payload.class_id && cc.course_id === payload.course_id
    );
    if (existing) return existing;
    const created: ClassCourse = { id: uid('cc'), ...payload };
    MOCK_CLASS_COURSES.push(created);
    return created;
  },

  /** Gỡ phân công khóa học khỏi lớp */
  async removeClassCourse(id: string): Promise<void> {
    await delay();
    const index = MOCK_CLASS_COURSES.findIndex((cc) => cc.id === id);
    if (index >= 0) MOCK_CLASS_COURSES.splice(index, 1);
  },

  /** Tạo buổi học mới */
  async createSession(payload: Omit<ClassSession, 'id'>): Promise<ClassSession> {
    await delay();
    const created: ClassSession = { ...payload, id: uid('ses') };
    MOCK_TIMETABLE.push(created);
    return created;
  },

  /** Cập nhật buổi học */
  async updateSession(id: string, patch: Partial<ClassSession>): Promise<ClassSession | undefined> {
    await delay();
    const session = MOCK_TIMETABLE.find((s) => s.id === id);
    if (!session) return undefined;
    Object.assign(session, patch);
    return session;
  },

  /** Xoá buổi học */
  async deleteSession(id: string): Promise<void> {
    await delay();
    const index = MOCK_TIMETABLE.findIndex((s) => s.id === id);
    if (index >= 0) MOCK_TIMETABLE.splice(index, 1);
  },
};
