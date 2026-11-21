import { School, SubscriptionPackage, Department, ClassSession, User } from '@/types';
import { MOCK_SCHOOLS, MOCK_PACKAGES, MOCK_DEPARTMENTS, MOCK_TIMETABLE } from './mock/data';

function normalizeSchool(raw: any): School {
  const sub = raw.current_subscription ?? raw.subscription ?? null;
  const owner: User | null =
    raw.owner ??
    (raw.owner_name
      ? {
          id: raw.owner_id || '',
          fullname: raw.owner_name,
          email: raw.email || '',
          role: 'USER' as const,
          status: true,
          created_at: raw.created_at || new Date().toISOString(),
          updated_at: raw.updated_at || new Date().toISOString(),
        }
      : null);

  return {
    id: String(raw.id),
    owner_id: raw.owner_id ?? null,
    owner,
    name: String(raw.name || ''),
    code: String(raw.code || ''),
    address: raw.address ?? null,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    status: raw.status || 'ACTIVE',
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
    current_subscription: sub,
    departments_count: Number(raw.departments_count ?? 0),
    students_count: Number(raw.students_count ?? sub?.used_students_count ?? 0),
    teachers_count: Number(raw.teachers_count ?? sub?.used_teachers_count ?? 0),
  };
}

export const schoolService = {
  // Get all schools (for Super Admin)
  async getSchools(search?: string): Promise<School[]> {
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : '';
      const res = await fetch(`/api/v1/schools${q}`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        const rows = Array.isArray(json?.data) ? json.data : [];
        if (rows.length > 0) {
          return rows.map(normalizeSchool);
        }
      }
    } catch {
      // fallback mock
    }
    return MOCK_SCHOOLS;
  },

  async createSchool(payload: {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
  }): Promise<School | null> {
    const res = await fetch('/api/v1/schools', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.message || 'Không thể tạo cơ sở trường học mới');
    }
    return json?.data ? normalizeSchool(json.data) : null;
  },

  async updateSchoolStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'): Promise<School | null> {
    const res = await fetch(`/api/v1/schools/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.message || 'Không thể cập nhật trạng thái trường học');
    }
    return json?.data ? normalizeSchool(json.data) : null;
  },

  // Get school detail
  async getSchoolById(id: string): Promise<School | undefined> {
    const list = await this.getSchools();
    return list.find((s) => s.id === id);
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
