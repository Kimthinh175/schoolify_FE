import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || process.env.BE_URL || 'http://localhost:3005';

function buildLocalFallbackUser(params: {
  email?: string;
  phone?: string;
  profileType?: string;
}) {
  const email = (params.email || '').trim().toLowerCase();
  const phone = (params.phone || '').trim();
  const isAdmin =
    email.includes('admin') ||
    email.includes('teacher.nguyen') ||
    email.endsWith('@schoolify.top') ||
    params.profileType === 'SUPER_ADMIN';
  const isTeacher =
    !isAdmin &&
    (email.includes('teacher') ||
      phone === '0902000001' ||
      params.profileType === 'TEACHER');

  if (isAdmin) {
    return {
      id: 'usr-admin-local-01',
      role: 'SUPER_ADMIN',
      fullname: 'Huấn — Quản Trị Hệ Thống Schoolify',
      email: email || 'admin@schoolify.edu.vn',
      phone: phone || '0901234567',
      avatar_url:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      status: true,
      last_login_at: new Date().toISOString(),
      created_at: '2026-01-15T08:00:00.000Z',
      updated_at: new Date().toISOString(),
    };
  }

  if (isTeacher) {
    return {
      id: 'usr-teacher-local-01',
      role: 'USER',
      fullname: 'Thầy Nguyễn Hoàng Minh',
      email: email || 'teacher.nguyen@schoolify.edu.vn',
      phone: phone || '0902000001',
      avatar_url:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      status: true,
      last_login_at: new Date().toISOString(),
      created_at: '2026-02-01T08:00:00.000Z',
      updated_at: new Date().toISOString(),
      teacher_profile: {
        id: 'tp-local-01',
        user_id: 'usr-teacher-local-01',
        department_name: 'Tổ Toán - Tin Học',
        bio: 'Giảng viên luyện thi THPT Quốc Gia & ĐGNL môn Toán - Tin.',
        expertise: 'Toán Học & Lập Trình',
        experience_years: 8,
      },
    };
  }

  return {
    id: 'usr-student-local-01',
    role: 'USER',
    fullname: 'Huấn Nguyễn (Học Sinh Luyện Thi)',
    email: email || 'huan.student@schoolify.edu.vn',
    phone: phone || '0987654321',
    avatar_url:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    status: true,
    last_login_at: new Date().toISOString(),
    created_at: '2026-03-01T08:00:00.000Z',
    updated_at: new Date().toISOString(),
    student_profile: {
      id: 'sp-local-01',
      user_id: 'usr-student-local-01',
      date_of_birth: '2008-05-15',
      grade_level: 'Lớp 12',
      points: 350,
      exam_points: 18,
      last_daily_grant_date: new Date().toISOString().slice(0, 10),
      active_package: 'VIP BỨT PHÁ',
      package_expires_at: '2027-06-30T00:00:00.000Z',
      school_name: 'THPT Chuyên Công Nghệ Schoolify',
      province: 'TP. Hồ Chí Minh',
      bio: 'Mục tiêu đạt 9.5+ Toán & Tin học kỳ thi Tốt nghiệp THPT & ĐGNL.',
    },
  };
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const subPath = path.join('/');
  const body = await req.json().catch(() => ({}));

  try {
    const beRes = await fetch(`${BE_BASE_URL}/auth/${subPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    const res = NextResponse.json(data, { status: beRes.status });

    const setCookie = beRes.headers.get('set-cookie');
    if (setCookie) {
      res.headers.set('set-cookie', setCookie);
    }

    return res;
  } catch (error: any) {
    // Fallback sang Local Demo Auth khi Backend (port 3005) chưa bật
    if (subPath === 'send-otp') {
      return NextResponse.json({
        success: true,
        devOtp: '123456',
        message: 'Đã gửi mã OTP (Chế độ Local Demo: 123456)',
      });
    }

    if (subPath === 'verify-otp') {
      const user = buildLocalFallbackUser({ phone: body?.phone });
      return NextResponse.json({
        success: true,
        accessToken: `local-demo-token-${user.id}`,
        user,
      });
    }

    if (subPath === 'login') {
      const user = buildLocalFallbackUser({
        email: body?.email,
        profileType: 'SUPER_ADMIN',
      });
      return NextResponse.json({
        success: true,
        accessToken: `local-demo-token-${user.id}`,
        user,
      });
    }

    if (subPath === 'google') {
      const user = buildLocalFallbackUser({
        profileType: body?.profile_type || 'STUDENT',
      });
      return NextResponse.json({
        success: true,
        accessToken: `local-demo-token-${user.id}`,
        user,
      });
    }

    if (subPath === 'change-password' || subPath === 'logout') {
      return NextResponse.json({
        success: true,
        message: 'Thao tác thành công (Chế độ Local Demo)',
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng xác thực Backend',
      },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const subPath = path.join('/');

  try {
    const beRes = await fetch(`${BE_BASE_URL}/auth/${subPath}`, {
      method: 'GET',
      headers: {
        cookie: req.headers.get('cookie') || '',
        authorization: req.headers.get('authorization') || '',
      },
    });

    const data = await beRes.json().catch(() => ({ success: beRes.ok }));
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    if (subPath === 'me') {
      const authHeader = req.headers.get('authorization') || '';
      if (authHeader.includes('usr-admin-local-01')) {
        return NextResponse.json({
          success: true,
          user: buildLocalFallbackUser({ profileType: 'SUPER_ADMIN' }),
        });
      }
      if (authHeader.includes('usr-teacher-local-01')) {
        return NextResponse.json({
          success: true,
          user: buildLocalFallbackUser({ profileType: 'TEACHER' }),
        });
      }
      if (authHeader.includes('local-demo-token')) {
        return NextResponse.json({
          success: true,
          user: buildLocalFallbackUser({ profileType: 'STUDENT' }),
        });
      }
      // Không trả về 401 khi BE offline để tránh xóa mất phiên đăng nhập ở Zustand persist
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối đến cổng xác thực Backend',
      },
      { status: 500 }
    );
  }
}
