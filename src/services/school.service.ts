import { School, SubscriptionPackage, Department, Class, ClassSession } from '@/types';
import { MOCK_SCHOOLS, MOCK_PACKAGES, MOCK_DEPARTMENTS, MOCK_TIMETABLE } from './mock/data';

export const schoolService = {
  // Get all schools (for Super Admin)
  async getSchools(): Promise<School[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SCHOOLS;
  },

  // Get school detail
  async getSchoolById(id: string): Promise<School | undefined> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SCHOOLS.find((s) => s.id === id);
  },

  // Get SaaS packages
  async getPackages(): Promise<SubscriptionPackage[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_PACKAGES;
  },

  // Get departments of a school
  async getDepartments(schoolId: string): Promise<Department[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_DEPARTMENTS.filter((d) => d.school_id === schoolId);
  },

  // Get classes timetable
  async getTimetable(classId?: string): Promise<ClassSession[]> {
    await new Promise((r) => setTimeout(r, 200));
    if (classId) return MOCK_TIMETABLE.filter((t) => t.class_id === classId);
    return MOCK_TIMETABLE;
  },
};
