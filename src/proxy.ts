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
 * Giải mã JWT payload phía Edge để điều hướng UX cho vùng /admin.
 * Lưu ý: Xác thực chữ ký & phân quyền thực thi chặt tại NestJS Backend (JwtAuthGuard + RolesGuard).
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

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

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

  // 1. Trang đăng nhập Admin (/admin hoặc /admin/login)
  if (isLoginPage) {
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }
    return NextResponse.next();
  }

  // 2. Chưa đăng nhập hoặc phiên hết hạn -> về /admin đăng nhập
  if (!token || !payload || isTokenExpired) {
    const loginUrl = new URL('/admin', req.url);
    loginUrl.searchParams.set('error', isTokenExpired ? 'session_expired' : 'unauthorized');
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);

    const response = NextResponse.redirect(loginUrl);
    if (isTokenExpired) {
      response.cookies.delete('access_token');
    }
    return response;
  }

  // 3. Có phiên đăng nhập nhưng không phải SUPER_ADMIN -> điều hướng 403
  if (!isSuperAdmin) {
    return NextResponse.redirect(new URL('/403', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
