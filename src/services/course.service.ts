import { Course, CourseChapter, Lesson } from '@/types';
import { MOCK_COURSES } from './mock/data';

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
};
