import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * Giải mã JWT payload an toàn đa môi trường (hỗ trợ cả Node.js & Next.js Edge runtime)
 * Không cần cài thêm thư viện phụ thuộc ngoài
 */
function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    if (typeof Buffer !== 'undefined') {
      const jsonStr = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(jsonStr);
    }

    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return JSON.parse(decoder.decode(bytes));
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Chỉ can thiệp vào các đường dẫn bắt đầu bằng /admin
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === '/admin' || pathname === '/admin/login';
  const token = req.cookies.get('access_token')?.value;
  const payload = token ? parseJwtPayload(token) : null;

  const isTokenExpired = Boolean(
    payload?.exp && payload.exp * 1000 <= Date.now()
  );
  const isSuperAdmin = Boolean(
    payload && payload.role === 'SUPER_ADMIN' && !isTokenExpired
  );

  // 1. Trường hợp truy cập trang Đăng nhập Admin (/admin hoặc /admin/login)
  if (isLoginPage) {
    // Nếu đã đăng nhập với quyền SUPER_ADMIN hợp lệ -> chuyển thẳng vào Dashboard
    if (isSuperAdmin) {
      const dashboardUrl = new URL('/admin/dashboard', req.url);
      return NextResponse.redirect(dashboardUrl);
    }
    // Chưa đăng nhập -> cho phép vào trang login bình thường
    return NextResponse.next();
  }

  // 2. Trường hợp truy cập các trang nội bộ Quản trị (/admin/dashboard, /admin/questions, /admin/users, ...)
  if (!token || !payload || isTokenExpired) {
    const loginUrl = new URL('/admin', req.url);
    loginUrl.searchParams.set('error', isTokenExpired ? 'session_expired' : 'unauthorized');
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);

    const response = NextResponse.redirect(loginUrl);
    // Nếu token đã hết hạn, xóa cookie cũ để tránh xung đột
    if (isTokenExpired) {
      response.cookies.delete('access_token');
    }
    return response;
  }

  // 3. Có token nhưng không có vai trò SUPER_ADMIN (ví dụ học sinh, giáo viên bình thường gõ link)
  if (!isSuperAdmin) {
    const forbiddenUrl = new URL('/admin', req.url);
    forbiddenUrl.searchParams.set('error', 'forbidden');
    forbiddenUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(forbiddenUrl);
  }

  // 4. Xác thực thành công: Gắn thêm header thông tin định danh cho request downstream
  const requestHeaders = new Headers(req.headers);
  if (payload.sub) requestHeaders.set('x-user-id', payload.sub);
  if (payload.role) requestHeaders.set('x-user-role', payload.role);
  if (payload.email) requestHeaders.set('x-user-email', payload.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Khớp toàn bộ đường dẫn quản trị /admin và các thư mục con
     * Bỏ qua file tĩnh, hình ảnh, favicon
     */
    '/admin/:path*',
  ],
};
