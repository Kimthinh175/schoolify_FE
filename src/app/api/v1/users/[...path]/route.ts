import { NextRequest, NextResponse } from 'next/server';

const BE_BASE_URL = process.env.NEXT_PUBLIC_BE_URL || 'http://localhost:3001';

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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const search = req.nextUrl.search || '';

    const beRes = await fetch(`${BE_BASE_URL}/users/${subPath}${search}`, {
      method: 'GET',
      headers: buildHeaders(req),
      cache: 'no-store',
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối Users Backend',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');
    const body = await req.json().catch(() => ({}));

    const beRes = await fetch(`${BE_BASE_URL}/users/${subPath}`, {
      method: 'PATCH',
      headers: buildHeaders(req),
      body: JSON.stringify(body),
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối Users Backend',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const subPath = path.join('/');

    const beRes = await fetch(`${BE_BASE_URL}/users/${subPath}`, {
      method: 'DELETE',
      headers: buildHeaders(req),
    });

    const data = await beRes.json();
    return NextResponse.json(data, { status: beRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Lỗi kết nối Users Backend',
      },
      { status: 500 }
    );
  }
}
