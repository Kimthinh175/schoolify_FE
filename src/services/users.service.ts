export interface AdminUserItem {
  id: string;
  fullname: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  google_id?: string | null;
  role: 'SUPER_ADMIN' | 'USER';
  appRole: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
  schoolName: string;
  province?: string | null;
  dateOfBirth?: string | null;
  bio?: string | null;
  status: boolean;
  points?: number;
  examPoints?: number;
  gradeLevel?: string;
  activePackage?: string | null;
  packageExpiresAt?: string | null;
  lastDailyGrantDate?: string | null;
  lastLoginAt?: string | null;
  created_at?: string;
}

export interface LocalProfileMetadata {
  date_of_birth?: string;
  school_name?: string;
  province?: string;
  bio?: string;
  equipped_frame?: string;
}

const LOCAL_PROFILE_META_PREFIX = 'schoolify_profile_meta_v1_';

export function getLocalProfileMetadata(userId?: string | null): LocalProfileMetadata {
  if (typeof window === 'undefined' || !userId) return {};
  try {
    const raw = window.localStorage.getItem(`${LOCAL_PROFILE_META_PREFIX}${userId}`);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

export function saveLocalProfileMetadata(userId: string, meta: Partial<LocalProfileMetadata>) {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const existing = getLocalProfileMetadata(userId);
    const merged = { ...existing, ...meta };
    window.localStorage.setItem(`${LOCAL_PROFILE_META_PREFIX}${userId}`, JSON.stringify(merged));
  } catch {}
}

export function normalizeGradeLevelLabel(raw?: string | number | null): string {
  if (raw === undefined || raw === null || raw === '') return 'Lớp 12';
  const str = String(raw).trim();
  const numMatch = str.match(/\d+/);
  if (numMatch) {
    return `Lớp ${numMatch[0]}`;
  }
  return str;
}

function getAuthHeaders(includeJsonContentType = false): Record<string, string> {
  const headers: Record<string, string> = includeJsonContentType
    ? { 'Content-Type': 'application/json' }
    : {};
  if (typeof window === 'undefined') return headers;
  try {
    const raw = window.localStorage.getItem('schoolify-auth-storage');
    if (!raw) return headers;
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.token;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return headers;
}

export const usersService = {
  /** Lấy danh sách người dùng từ PostgreSQL (`GET /api/v1/users`) */
  async getUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: AdminUserItem[]; total: number }> {
    try {
      const qs = new URLSearchParams();
      if (params?.search) qs.set('search', params.search);
      if (params?.role && params.role !== 'ALL') qs.set('role', params.role);
      qs.set('page', String(params?.page || 1));
      qs.set('limit', String(params?.limit || 100));

      const res = await fetch(`/api/v1/users?${qs.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(false),
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) return { items: [], total: 0 };
      const json = await res.json();
      const rawItems = Array.isArray(json?.items) ? json.items : [];
      return {
        items: rawItems.map((u: any) => {
          const sp = u.student_profile || {};
          const rawGrade = u.gradeLevel ?? u.grade_level ?? sp.grade_level;
          return {
            ...u,
            name: u.name || u.fullname || 'Người dùng Schoolify',
            appRole:
              u.appRole ||
              (u.role === 'SUPER_ADMIN'
                ? 'SUPER_ADMIN'
                : u.teacher_profile
                  ? 'TEACHER'
                  : 'STUDENT'),
            schoolName:
              u.schoolName ||
              u.school_name ||
              sp.school_name ||
              u.school_memberships?.[0]?.school?.name ||
              (u.role === 'SUPER_ADMIN'
                ? 'Nền Tảng Gốc Schoolify'
                : u.teacher_profile
                  ? 'Hội Đồng Giảng Viên Schoolify'
                  : 'Học Sinh Toàn Quốc'),
            province: u.province ?? sp.province ?? null,
            dateOfBirth: u.dateOfBirth ?? u.date_of_birth ?? sp.date_of_birth ?? null,
            bio: u.bio ?? sp.bio ?? u.teacher_profile?.bio ?? null,
            points: typeof u.points === 'number' ? u.points : sp.points,
            examPoints:
              typeof u.examPoints === 'number'
                ? u.examPoints
                : typeof u.exam_points === 'number'
                  ? u.exam_points
                  : sp.exam_points,
            gradeLevel: rawGrade ? normalizeGradeLevelLabel(rawGrade) : undefined,
            activePackage: u.activePackage ?? u.active_package ?? sp.active_package ?? null,
            packageExpiresAt:
              u.packageExpiresAt ?? u.package_expires_at ?? sp.package_expires_at ?? null,
            lastDailyGrantDate:
              u.lastDailyGrantDate ?? u.last_daily_grant_date ?? sp.last_daily_grant_date ?? null,
            lastLoginAt: u.lastLoginAt ?? u.last_login_at ?? null,
            status: Boolean(u.status ?? true),
          };
        }),
        total: Number(json?.pagination?.total || rawItems.length),
      };
    } catch (err) {
      console.warn('[usersService.getUsers] Failed:', err);
      return { items: [], total: 0 };
    }
  },

  /** Tạo người dùng mới (`POST /api/v1/users`) */
  async createUser(payload: {
    fullname: string;
    email: string;
    phone?: string;
    password?: string;
    role: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
    grade_level?: string;
    date_of_birth?: string;
  }): Promise<AdminUserItem | null> {
    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: getAuthHeaders(true),
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.user || null;
    } catch (err) {
      console.warn('[usersService.createUser] Failed:', err);
      return null;
    }
  },

  /** Cập nhật người dùng (`PATCH /api/v1/users/:id`) */
  async updateUser(
    id: string,
    payload: {
      fullname?: string;
      phone?: string;
      avatar_url?: string;
      status?: boolean;
      role?: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
      points?: number;
      exam_points?: number;
      grade_level?: string;
      date_of_birth?: string;
      school_name?: string;
      province?: string;
      bio?: string;
      equipped_frame?: string;
      active_package?: string;
      package_expires_at?: string;
    }
  ): Promise<AdminUserItem | null> {
    saveLocalProfileMetadata(id, {
      ...(payload.date_of_birth !== undefined ? { date_of_birth: payload.date_of_birth } : {}),
      ...(payload.school_name !== undefined ? { school_name: payload.school_name } : {}),
      ...(payload.province !== undefined ? { province: payload.province } : {}),
      ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
      ...(payload.equipped_frame !== undefined ? { equipped_frame: payload.equipped_frame } : {}),
    });

    const res = await fetch(`/api/v1/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: getAuthHeaders(true),
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = Array.isArray(json?.message)
        ? json.message.join(', ')
        : json?.message || `Cập nhật hồ sơ thất bại (${res.status})`;
      throw new Error(msg);
    }
    return json?.user || null;
  },

  /** Xóa người dùng (`DELETE /api/v1/users/:id`) */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
      });
      return res.ok;
    } catch (err) {
      console.warn('[usersService.deleteUser] Failed:', err);
      return false;
    }
  },
};
