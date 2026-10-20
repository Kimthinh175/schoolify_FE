export interface AdminUserItem {
  id: string;
  fullname: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  role: 'SUPER_ADMIN' | 'USER';
  appRole: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT';
  schoolName: string;
  status: boolean;
  points?: number;
  examPoints?: number;
  gradeLevel?: string;
  created_at?: string;
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
        cache: 'no-store',
      });
      if (!res.ok) return { items: [], total: 0 };
      const json = await res.json();
      const rawItems = Array.isArray(json?.items) ? json.items : [];
      return {
        items: rawItems.map((u: any) => ({
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
            u.school_memberships?.[0]?.school?.name ||
            (u.role === 'SUPER_ADMIN'
              ? 'Nền Tảng Gốc Schoolify'
              : u.teacher_profile
                ? 'Hội Đồng Giảng Viên Schoolify'
                : 'Học Sinh Toàn Quốc'),
          status: Boolean(u.status ?? true),
        })),
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
  }): Promise<AdminUserItem | null> {
    try {
      const res = await fetch('/api/v1/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      grade_level?: string;
    }
  ): Promise<AdminUserItem | null> {
    try {
      const res = await fetch(`/api/v1/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json?.user || null;
    } catch (err) {
      console.warn('[usersService.updateUser] Failed:', err);
      return null;
    }
  },

  /** Xóa người dùng (`DELETE /api/v1/users/:id`) */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/v1/users/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('[usersService.deleteUser] Failed:', err);
      return false;
    }
  },
};
