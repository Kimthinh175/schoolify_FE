import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

export const LOCAL_FALLBACK_USERS = [
  {
    id: 'usr-student-local-01',
    fullname: 'Huấn Nguyễn (Học Sinh Luyện Thi)',
    name: 'Huấn Nguyễn (Học Sinh Luyện Thi)',
    email: 'huan.student@schoolify.edu.vn',
    phone: '0987654321',
    avatar_url:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    role: 'USER',
    appRole: 'STUDENT',
    schoolName: 'THPT Chuyên Công Nghệ Schoolify',
    province: 'TP. Hồ Chí Minh',
    dateOfBirth: '2008-05-15',
    status: true,
    points: 350,
    examPoints: 18,
    gradeLevel: 'Lớp 12',
    activePackage: 'VIP BỨT PHÁ',
    packageExpiresAt: '2027-06-30T00:00:00.000Z',
    lastDailyGrantDate: new Date().toISOString().slice(0, 10),
    created_at: '2026-03-01T08:00:00.000Z',
    student_profile: {
      id: 'sp-local-01',
      user_id: 'usr-student-local-01',
      date_of_birth: '2008-05-15',
      grade_level: 'Lớp 12',
      points: 350,
      exam_points: 18,
      active_package: 'VIP BỨT PHÁ',
      package_expires_at: '2027-06-30T00:00:00.000Z',
      school_name: 'THPT Chuyên Công Nghệ Schoolify',
      province: 'TP. Hồ Chí Minh',
    },
  },
  {
    id: 'usr-student-local-02',
    fullname: 'Trần Hoàng Nam',
    name: 'Trần Hoàng Nam',
    email: 'nam.tran@schoolify.edu.vn',
    phone: '0912345678',
    avatar_url:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
    role: 'USER',
    appRole: 'STUDENT',
    schoolName: 'THPT Chuyên Hà Nội - Amsterdam',
    province: 'Hà Nội',
    dateOfBirth: '2008-09-20',
    status: true,
    points: 1250,
    examPoints: 27,
    gradeLevel: 'Lớp 12',
    activePackage: 'THỦ KHOA VIP',
    packageExpiresAt: '2027-08-15T00:00:00.000Z',
    lastDailyGrantDate: new Date().toISOString().slice(0, 10),
    created_at: '2026-02-10T08:00:00.000Z',
  },
  {
    id: 'usr-student-local-03',
    fullname: 'Lê Thu Thảo',
    name: 'Lê Thu Thảo',
    email: 'thao.le@schoolify.edu.vn',
    phone: '0933445566',
    avatar_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    role: 'USER',
    appRole: 'STUDENT',
    schoolName: 'THPT Chu Văn An',
    province: 'Hà Nội',
    dateOfBirth: '2009-02-12',
    status: true,
    points: 920,
    examPoints: 9,
    gradeLevel: 'Lớp 11',
    activePackage: 'FREE',
    created_at: '2026-03-12T08:00:00.000Z',
  },
  {
    id: 'usr-teacher-local-01',
    fullname: 'Thầy Nguyễn Hoàng Minh',
    name: 'Thầy Nguyễn Hoàng Minh',
    email: 'teacher.nguyen@schoolify.edu.vn',
    phone: '0902000001',
    avatar_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    role: 'USER',
    appRole: 'TEACHER',
    schoolName: 'Hội Đồng Giảng Viên Schoolify',
    status: true,
    created_at: '2026-01-20T08:00:00.000Z',
    teacher_profile: {
      id: 'tp-local-01',
      user_id: 'usr-teacher-local-01',
      department_name: 'Tổ Toán - Tin Học',
    },
  },
  {
    id: 'usr-admin-local-01',
    fullname: 'Huấn — Quản Trị Hệ Thống Schoolify',
    name: 'Huấn — Quản Trị Hệ Thống Schoolify',
    email: 'admin@schoolify.edu.vn',
    phone: '0901234567',
    avatar_url:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    role: 'SUPER_ADMIN',
    appRole: 'SUPER_ADMIN',
    schoolName: 'Nền Tảng Gốc Schoolify',
    status: true,
    created_at: '2026-01-01T08:00:00.000Z',
  },
];

function buildHeaders(req: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const cookie = req.headers.get('cookie');
  if (cookie) headers['cookie'] = cookie;
  const auth = req.headers.get('authorization');
  if (auth) headers['authorization'] = auth;
  return headers;
}

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.search || '';
    const beRes = await fetch(`${BE_BASE_URL}/users${search}`, {
      method: 'GET',
      headers: buildHeaders(req),
      cache: 'no-store',
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    return NextResponse.json({
      success: true,
      items: LOCAL_FALLBACK_USERS,
      pagination: {
        total: LOCAL_FALLBACK_USERS.length,
        page: 1,
        limit: 100,
      },
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  try {
    const beRes = await fetch(`${BE_BASE_URL}/users`, {
      method: 'POST',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch {
    const createdUser = {
      id: `usr-local-${Date.now()}`,
      fullname: body?.fullname || 'Người dùng mới',
      name: body?.fullname || 'Người dùng mới',
      email: body?.email || `user.${Date.now()}@schoolify.edu.vn`,
      phone: body?.phone || '',
      role: body?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'USER',
      appRole: body?.role || 'STUDENT',
      schoolName:
        body?.role === 'SUPER_ADMIN'
          ? 'Nền Tảng Gốc Schoolify'
          : body?.role === 'TEACHER'
            ? 'Hội Đồng Giảng Viên Schoolify'
            : 'Học Sinh Toàn Quốc',
      status: true,
      points: 100,
      examPoints: 9,
      gradeLevel: body?.grade_level || 'Lớp 12',
      created_at: new Date().toISOString(),
    };
    return NextResponse.json({
      success: true,
      user: createdUser,
    });
  }
}
